import type { Answer, Question } from "@/lib/types";

const pct = (n: number) => `${Math.round(n * 100)}%`;

function Bar({ value, tone }: { value: number; tone: "accent" | "ok" | "bad" | "dim" }) {
  const color = { accent: "bg-accent", ok: "bg-ok", bad: "bg-bad", dim: "bg-fg-dim" }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-bg">
      <div className={`bar-grow h-full rounded ${color}`} style={{ width: `${Math.max(1, value * 100)}%` }} />
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  const tone = value >= 0.8 ? "text-ok" : value >= 0.5 ? "text-warn" : "text-bad";
  return <span className={`text-[13px] ${tone}`}>confidence {value.toFixed(2)}</span>;
}

function Row({ label, p, hit, tone }: { label: string; p: number; hit: boolean; tone: "accent" | "ok" }) {
  const text = tone === "accent" ? "text-accent" : "text-ok";
  return (
    <div>
      <div className="mb-0.5 flex justify-between gap-3 text-[13px]">
        <span className={hit ? `font-semibold ${text}` : "text-fg-muted"}>{label}</span>
        <span className={hit ? text : "text-fg-dim"}>{pct(p)}</span>
      </div>
      <Bar value={p} tone={hit ? tone : "dim"} />
    </div>
  );
}

export function AnswerCard({ id, answer, question }: { id: string; answer: Answer; question?: Question }) {
  const topLevel =
    answer.type === "score"
      ? Object.entries(answer.probabilities).sort((a, b) => b[1] - a[1])[0]?.[0]
      : undefined;
  return (
    <div className="rounded-md border border-border bg-bg-panel p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold">{id}</span>
        <span className="text-[12px] uppercase text-fg-dim">{answer.type}</span>
        {(answer.type === "choice" || answer.type === "score") && (
          <span className="ml-auto">
            <Confidence value={answer.confidence} />
          </span>
        )}
      </div>

      {answer.type === "noul" && (
        <div>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-fg-muted">
              {question?.type === "noul" ? String(question.instructions) : "P(yes)"}
            </span>
            <span className={`text-2xl font-semibold ${answer.noul >= 0.5 ? "text-ok" : "text-bad"}`}>
              {answer.noul.toFixed(2)}
            </span>
          </div>
          <Bar value={answer.noul} tone={answer.noul >= 0.5 ? "ok" : "bad"} />
        </div>
      )}

      {answer.type === "choice" && (
        <div className="space-y-2.5">
          {Object.entries(answer.probabilities)
            .sort((a, b) => b[1] - a[1])
            .map(([opt, p]) => (
              <Row key={opt} label={opt} p={p} hit={opt === answer.choice} tone="accent" />
            ))}
        </div>
      )}

      {answer.type === "score" && (
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[13px] text-fg-muted">score</span>
            <span className="text-2xl font-semibold text-ok">{answer.score.toFixed(2)}</span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(answer.legend).map(([level, label]) => (
              <Row
                key={level}
                label={`${level} · ${label}`}
                p={answer.probabilities[level] ?? 0}
                hit={level === topLevel}
                tone="ok"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
