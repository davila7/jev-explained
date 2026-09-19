"use client";

import { useEffect, useRef, useState } from "react";
import type { Run, TraceEvent } from "@/lib/trace";
import type { Question } from "@/lib/types";
import { AnswerCard } from "./AnswerCard";

type Props = {
  runs: Run[];
  questions: Record<string, Question>;
  onClear: () => void;
};

type Tone = "accent" | "ok" | "bad" | "warn" | "info" | "dim";

export function TracePanel({ runs, questions, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [runs]);

  return (
    <aside className="flex h-full w-[540px] shrink-0 flex-col border-l border-border bg-bg-elev">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div className="text-[13px] uppercase tracking-wider text-fg-dim">Session</div>
        {runs.length > 0 && (
          <button type="button" onClick={onClear} className="text-[13px] text-fg-dim hover:text-fg">
            clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {runs.length === 0 ? (
          <div className="mt-16 text-center text-sm text-fg-dim">Press Run to see Jev work.</div>
        ) : (
          runs.map((run) => <RunBlock key={run.id} run={run} questions={questions} />)
        )}
        <div ref={bottomRef} />
      </div>
    </aside>
  );
}

function RunBlock({ run, questions }: { run: Run; questions: Record<string, Question> }) {
  return (
    <div className="mb-6">
      <div className="mb-3 text-[13px] text-fg-dim">
        run #{run.id} · {run.exampleTitle}
      </div>
      <ol className="relative ml-2 border-l border-border pl-6">
        {run.events.map((ev, i) => (
          <EventRow key={i} ev={ev} questions={questions} />
        ))}
        {run.status === "running" && (
          <li className="fade-up relative pb-4">
            <Dot tone="accent" pulse />
            <div className="text-sm text-fg-muted">Waiting for Jev…</div>
          </li>
        )}
      </ol>
    </div>
  );
}

function Dot({ tone, pulse }: { tone: Tone; pulse?: boolean }) {
  const cls = {
    accent: "bg-accent",
    ok: "bg-ok",
    bad: "bg-bad",
    warn: "bg-warn",
    info: "bg-info",
    dim: "bg-fg-dim",
  }[tone];
  return (
    <span
      className={`absolute -left-[30px] top-[5px] h-3 w-3 rounded-full ring-4 ring-bg-elev ${cls} ${pulse ? "pulse" : ""}`}
    />
  );
}

function Head({ title, tone, meta }: { title: string; tone: Tone; meta?: string }) {
  return (
    <>
      <Dot tone={tone} />
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-fg">{title}</span>
        {meta && <span className="text-[13px] text-fg-dim">{meta}</span>}
      </div>
    </>
  );
}

function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="text-[13px] text-fg-dim hover:text-fg">
        {open ? "▾" : "▸"} {label}
      </button>
      {open && (
        <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-border bg-bg p-3 text-[13px] leading-relaxed text-fg-muted">
          {children}
        </pre>
      )}
    </div>
  );
}

function EventRow({ ev, questions }: { ev: TraceEvent; questions: Record<string, Question> }) {
  switch (ev.kind) {
    case "request":
      return (
        <li className="fade-up relative pb-7">
          <Head
            title="Request"
            tone="dim"
            meta={`${ev.request.model} · ${Object.keys(ev.request.questions).length} questions`}
          />
          <Collapsible label="JSON">{JSON.stringify(ev.request, null, 2)}</Collapsible>
        </li>
      );
    case "response":
      return (
        <li className="fade-up relative pb-7">
          <Head title={`Response · ${ev.latencyMs} ms`} tone="ok" meta={`${ev.usage.input_tokens} tokens in · 0 out`} />
          <Collapsible label="JSON">{JSON.stringify(ev.raw, null, 2)}</Collapsible>
        </li>
      );
    case "answers":
      return (
        <li className="fade-up relative pb-7">
          <Head title="Answers" tone="accent" />
          <div className="mt-2 space-y-3">
            {Object.entries(ev.answers).map(([id, a]) => (
              <AnswerCard key={id} id={id} answer={a} question={questions[id]} />
            ))}
          </div>
        </li>
      );
    case "decision": {
      const box = {
        ok: "border-ok/40 bg-ok-soft text-ok",
        warn: "border-warn/40 bg-warn-soft text-warn",
        bad: "border-bad/40 bg-bad-soft text-bad",
      }[ev.tone];
      return (
        <li className="fade-up relative pb-2">
          <Head title="Your code decides" tone={ev.tone} />
          <div className={`mt-2 rounded-md border px-3 py-2 ${box}`}>
            <div className="text-sm font-semibold">{ev.label}</div>
            <div className="mt-0.5 text-[13px] opacity-80">{ev.detail}</div>
          </div>
        </li>
      );
    }
    case "error":
      return (
        <li className="fade-up relative pb-2">
          <Head title={ev.status ? `Error · HTTP ${ev.status}` : "Error"} tone="bad" />
          <div className="mt-2 rounded-md border border-bad/40 bg-bad-soft px-3 py-2 text-[13px] text-bad">
            {ev.message}
          </div>
          {ev.raw !== undefined && <Collapsible label="body">{JSON.stringify(ev.raw, null, 2)}</Collapsible>}
        </li>
      );
  }
}
