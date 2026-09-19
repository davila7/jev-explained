"use client";

import { useState } from "react";
import type { Example } from "@/lib/types";

type Props = {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  examples: Example[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ apiKey, onApiKeyChange, examples, selectedId, onSelect }: Props) {
  const [show, setShow] = useState(false);
  const hasKey = apiKey.trim().length > 0;

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-border bg-bg-elev">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/60 bg-accent-soft text-accent">
          <span className="text-base leading-none">λ</span>
        </div>
        <div className="text-sm font-semibold tracking-tight">Jev Explained</div>
      </div>

      <div className="border-b border-border px-6 py-5">
        <div className="mb-2 flex items-center justify-between text-[13px] uppercase tracking-wider text-fg-dim">
          <span>API key</span>
          <a
            href="https://console.typesafe.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="normal-case text-fg-dim hover:text-fg"
          >
            get one ↗
          </a>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-bg px-2 focus-within:border-border-strong">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${hasKey ? "bg-ok" : "bg-warn"}`} />
          <input
            type={show ? "text" : "password"}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="paste your key"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-fg-dim"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="px-1 text-[13px] text-fg-dim hover:text-fg"
          >
            {show ? "hide" : "show"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-2 text-[13px] uppercase tracking-wider text-fg-dim">Examples</div>
        <ul className="space-y-1">
          {examples.map((ex) => {
            const active = ex.id === selectedId;
            return (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => onSelect(ex.id)}
                  className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? "border-accent/50 bg-accent-soft text-accent"
                      : "border-transparent text-fg hover:border-border hover:bg-bg-hover"
                  }`}
                >
                  {ex.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-border px-5 py-3 text-[13px] text-fg-dim">
        <a className="hover:text-fg" href="https://docs.typesafe.ai" target="_blank" rel="noreferrer">
          docs.typesafe.ai ↗
        </a>
      </div>
    </aside>
  );
}
