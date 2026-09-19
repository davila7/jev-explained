// Types mirror the TypeSafe HTTP API: https://docs.typesafe.ai/api

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type NoulQuestion = {
  type: "noul";
  instructions: JsonValue;
  criteria?: { true?: string; false?: string };
};

export type ChoiceQuestion = {
  type: "choice";
  instructions: JsonValue;
  criteria: Record<string, string | null>;
};

export type ScoreQuestion = {
  type: "score";
  instructions: JsonValue;
  criteria: string[];
};

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type JevRequest = {
  model: string;
  state: JsonValue;
  questions: Record<string, Question>;
};

export type NoulAnswer = { type: "noul"; noul: number };
export type ChoiceAnswer = {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};
export type ScoreAnswer = {
  type: "score";
  score: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
  confidence: number;
};
export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export type JevResponse = {
  model: string;
  answers: Record<string, Answer>;
  usage: { input_tokens: number; output_tokens: number };
};

/** What the /api/jev proxy returns to the browser. */
export type ProxyResult = {
  ok: boolean;
  status: number;
  latencyMs: number;
  requestId: string | null;
  body: JevResponse | { error?: unknown; detail?: unknown } | string;
};

/** A runnable example shown in the sidebar. */
export type Example = {
  id: string;
  title: string;
  category: string;
  description: string;
  state: string;
  questions: Record<string, Question>;
  /** Alternative states the user can swap in quickly. */
  samples: { label: string; state: string }[];
  /** Turn the answers into the decision your code would make. */
  decide: (answers: Record<string, Answer>) => { label: string; detail: string; tone: "ok" | "warn" | "bad" };
};

/** The textarea always holds a string; send it as structured state when it is valid JSON. */
export function parseState(raw: string): JsonValue {
  const t = raw.trim();
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      return JSON.parse(t) as JsonValue;
    } catch {}
  }
  return raw;
}
