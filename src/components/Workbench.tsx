"use client";

import { useEffect, useState } from "react";
import { parseState, type Example, type Question } from "@/lib/types";
import { PROVIDERS, type ProviderId } from "@/lib/providers";

type Props = {
  provider: ProviderId;
  example: Example;
  state: string;
  onStateChange: (s: string) => void;
  onRun: () => void;
  running: boolean;
  canRun: boolean;
};

const TYPE_STYLES: Record<Question["type"], string> = {
  noul: "text-info border-info/40 bg-info-soft",
  choice: "text-accent border-accent/40 bg-accent-soft",
  score: "text-ok border-ok/40 bg-ok-soft",
};

export function Workbench({
  provider,
  example,
  state,
  onStateChange,
  onRun,
  running,
  canRun,
}: Props) {
  const [view, setView] = useState<"cards" | "json">("cards");
  const { url, model } = PROVIDERS[provider];
  const compact = Object.keys(example.questions).length > 5;
  const requestJson = JSON.stringify(
    { model, state: parseState(state), questions: example.questions },
    null,
    2,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canRun && !running) {
        e.preventDefault();
        onRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canRun, running, onRun]);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
      <header className="flex items-start justify-between gap-6 border-b border-border px-10 py-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {example.title}
          </h1>
          <p className="mt-1 max-w-2xl text-fg-muted">{example.description}</p>
        </div>
        <div className="flex shrink-0 overflow-hidden rounded-md border border-border">
          <ViewButton
            active={view === "cards"}
            onClick={() => setView("cards")}
            title="Formatted"
          >
            ≡
          </ViewButton>
          <ViewButton
            active={view === "json"}
            onClick={() => setView("json")}
            title="Request JSON"
          >
            {"</>"}
          </ViewButton>
        </div>
      </header>

      {view === "json" ? (
        <div className="px-10 py-8">
          <div className="mb-2 flex items-center justify-between text-[13px] uppercase tracking-wider text-fg-dim">
            <span>Request body</span>
            <span className="normal-case">POST {url}</span>
          </div>
          <pre className="overflow-auto rounded-md border border-border bg-bg p-5 text-sm leading-relaxed text-fg-muted">
            {requestJson}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 px-10 py-8 xl:grid-cols-[1.1fr_1fr]">
          <div className="flex min-w-0 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[13px] uppercase tracking-wider text-fg-dim">
                State
              </div>
              <div className="flex gap-1">
                {example.samples.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => onStateChange(s.state)}
                    className={`rounded border px-2 py-0.5 text-[13px] transition-colors ${
                      s.state === state
                        ? "border-accent/50 bg-accent-soft text-accent"
                        : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              spellCheck={false}
              className="h-[460px] resize-y rounded-md border border-border bg-bg p-4 text-sm leading-relaxed text-fg outline-none focus:border-border-strong"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="mb-2 text-[13px] uppercase tracking-wider text-fg-dim">
              Questions
            </div>
            {compact ? (
              <CompactQuestions questions={example.questions} />
            ) : (
              <div className="space-y-4">
                {Object.entries(example.questions).map(([id, q]) => (
                  <div
                    key={id}
                    className="rounded-md border border-border bg-bg-panel p-5"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-fg">
                        {id}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-px text-[12px] uppercase ${TYPE_STYLES[q.type]}`}
                      >
                        {q.type}
                      </span>
                    </div>
                    <div className="text-sm text-fg-muted">
                      {String(q.instructions)}
                    </div>
                    <QuestionCriteria q={q} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="relative sticky bottom-0 mt-auto flex items-center border-t border-border bg-bg-elev/95 px-10 py-5 backdrop-blur">
        <button
          type="button"
          onClick={onRun}
          disabled={!canRun || running}
          className="flex items-center gap-2 rounded-md border border-accent bg-accent px-5 py-2 text-sm font-semibold text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? (
            <>
              <span className="pulse">●</span> Running…
            </>
          ) : (
            <>▶ Run</>
          )}
        </button>
        <span className="ml-4 text-[13px] text-fg-dim">⌘↵</span>
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4 text-[13px] text-fg-dim">
          <a
            href="https://github.com/davila7/jev-explained"
            target="_blank"
            rel="noreferrer"
            title="If this helped you understand Jev, leave a star on GitHub"
            className="transition-colors hover:text-fg"
          >
            ★ github.com/davila7/jev-explained
          </a>
          <span>·</span>
          <span>
            built by{" "}
            <a
              href="https://x.com/dani_avila7"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-fg"
            >
              @dani_avila7
            </a>
          </span>
        </div>
      </footer>
    </section>
  );
}

function QuestionCriteria({ q }: { q: Question }) {
  if (q.type === "noul") return null;
  const items =
    q.type === "choice"
      ? Object.keys(q.criteria)
      : q.criteria.map((level, i) => `${i} · ${level}`);
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {items.map((it) => (
        <span
          key={it}
          className="rounded border border-border px-1.5 py-px text-[13px] text-fg-muted"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-bg-hover text-fg" : "text-fg-dim hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

/** Fan-out examples repeat the same question shape many times; show it once. */
function CompactQuestions({
  questions,
}: {
  questions: Record<string, Question>;
}) {
  const entries = Object.entries(questions);
  const shownCriteria = new Set<string>();
  return (
    <div className="space-y-2">
      {entries.map(([id, q]) => {
        const key = q.type + JSON.stringify(q.criteria ?? null);
        const first = !shownCriteria.has(key);
        shownCriteria.add(key);
        return (
          <div
            key={id}
            className="rounded-md border border-border bg-bg-panel px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-fg">{id}</span>
              <span
                className={`rounded border px-1.5 py-px text-[12px] uppercase ${TYPE_STYLES[q.type]}`}
              >
                {q.type}
              </span>
              <span className="truncate text-sm text-fg-muted">
                {String(q.instructions)}
              </span>
            </div>
            {first ? (
              <QuestionCriteria q={q} />
            ) : (
              <div className="mt-1 text-[12px] text-fg-dim">
                same criteria as above
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
