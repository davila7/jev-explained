"use client";

import { useCallback, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Workbench } from "@/components/Workbench";
import { TracePanel } from "@/components/TracePanel";
import { EXAMPLES } from "@/lib/examples";
import { PROVIDERS } from "@/lib/providers";
import type { Run, TraceEvent } from "@/lib/trace";
import { useApiKey } from "@/lib/useApiKey";
import type { JevRequest, JevResponse, ProxyResult } from "@/lib/types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const { provider, apiKey, setProvider, setApiKey } = useApiKey();
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);
  const example = useMemo(
    () => EXAMPLES.find((e) => e.id === selectedId) ?? EXAMPLES[0],
    [selectedId],
  );
  const [state, setState] = useState(example.state);
  const [runs, setRuns] = useState<Run[]>([]);
  const running = runs.some((r) => r.status === "running");

  const onSelect = (id: string) => {
    setSelectedId(id);
    const ex = EXAMPLES.find((e) => e.id === id);
    if (ex) setState(ex.state);
  };

  const run = useCallback(async () => {
    const id = runs.length + 1;
    const push = (ev: TraceEvent, status?: Run["status"]) =>
      setRuns((rs) =>
        rs.map((r) =>
          r.id === id
            ? { ...r, events: [...r.events, ev], status: status ?? r.status }
            : r,
        ),
      );

    const request: JevRequest = {
      model: PROVIDERS[provider].model,
      state,
      questions: example.questions,
    };
    setRuns((rs) => [
      ...rs,
      {
        id,
        exampleTitle: `${example.title} · ${PROVIDERS[provider].label}`,
        startedAt: Date.now(),
        status: "running",
        events: [{ kind: "request", at: Date.now(), request }],
      },
    ]);

    let result: ProxyResult;
    try {
      const res = await fetch("/api/jev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-jev-api-key": apiKey.trim(),
          "x-jev-provider": provider,
        },
        body: JSON.stringify(request),
      });
      result = (await res.json()) as ProxyResult;
    } catch (err) {
      push(
        {
          kind: "error",
          at: Date.now(),
          status: 0,
          message: err instanceof Error ? err.message : String(err),
        },
        "error",
      );
      return;
    }

    if (
      !result.ok ||
      typeof result.body === "string" ||
      !("answers" in result.body)
    ) {
      const message =
        result.status === 401
          ? "Invalid API key."
          : result.status === 422
            ? "Request body failed validation."
            : result.status === 429
              ? "Rate limited. Retry in a moment."
              : typeof result.body === "string"
                ? result.body
                : `Request failed (HTTP ${result.status}).`;
      push(
        {
          kind: "error",
          at: Date.now(),
          status: result.status,
          message,
          raw: result.body,
        },
        "error",
      );
      return;
    }

    const data = result.body as JevResponse;
    push({
      kind: "response",
      at: Date.now(),
      latencyMs: result.latencyMs,
      model: data.model,
      usage: data.usage,
      raw: data,
    });
    await wait(250);
    push({ kind: "answers", at: Date.now(), answers: data.answers });
    await wait(350);
    push(
      { kind: "decision", at: Date.now(), ...example.decide(data.answers) },
      "done",
    );
  }, [apiKey, provider, example, runs.length, state]);

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        provider={provider}
        onProviderChange={setProvider}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        examples={EXAMPLES}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <Workbench
        provider={provider}
        example={example}
        state={state}
        onStateChange={setState}
        onRun={run}
        running={running}
        canRun={apiKey.trim().length > 0 && state.trim().length > 0}
      />
      <TracePanel
        runs={runs}
        questions={example.questions}
        onClear={() => setRuns([])}
      />
    </main>
  );
}
