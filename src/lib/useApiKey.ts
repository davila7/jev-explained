"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isProviderId, type ProviderId } from "./providers";

const KEY = "jev-explained:settings";
const LEGACY_KEY = "jev-explained:api-key";
const listeners = new Set<() => void>();

type Settings = { provider: ProviderId; keys: Partial<Record<ProviderId, string>> };
const EMPTY: Settings = { provider: "typesafe", keys: {} };

let cache: Settings | null = null;

function read(): Settings {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Settings>) : {};
    // Migrate the single-key format used before provider selection existed.
    const legacy = localStorage.getItem(LEGACY_KEY);
    cache = {
      provider: isProviderId(parsed.provider) ? parsed.provider : "typesafe",
      keys: { ...(legacy ? { typesafe: legacy } : {}), ...parsed.keys },
    };
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Settings) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => {
    cache = null;
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Selected provider and its API key, persisted in localStorage. Server snapshot is empty so hydration matches. */
export function useApiKey() {
  const settings = useSyncExternalStore(subscribe, read, () => EMPTY);
  const provider = settings.provider;
  const apiKey = settings.keys[provider] ?? "";

  const setProvider = useCallback((p: ProviderId) => write({ ...read(), provider: p }), []);
  const setApiKey = useCallback((k: string) => {
    const cur = read();
    write({ ...cur, keys: { ...cur.keys, [cur.provider]: k } });
  }, []);

  return { provider, apiKey, setProvider, setApiKey };
}
