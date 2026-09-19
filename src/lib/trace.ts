import type { Answer, JevRequest } from "./types";

export type TraceEvent =
  | { kind: "request"; at: number; request: JevRequest }
  | {
      kind: "response";
      at: number;
      latencyMs: number;
      questionIds: Record<string, unknown>;
      model: string;
      usage: { input_tokens: number; output_tokens: number };
      raw: unknown;
    }
  | { kind: "answers"; at: number; answers: Record<string, Answer> }
  | {
      kind: "decision";
      at: number;
      label: string;
      detail: string;
      tone: "ok" | "warn" | "bad";
    }
  | {
      kind: "error";
      at: number;
      status: number;
      message: string;
      raw?: unknown;
    };

export type Run = {
  id: number;
  exampleTitle: string;
  startedAt: number;
  status: "running" | "done" | "error";
  events: TraceEvent[];
};
