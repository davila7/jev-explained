"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "jev-explained:api-key";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** API key persisted in localStorage; server snapshot is "" so hydration matches. */
export function useApiKey(): [string, (k: string) => void] {
  const key = useSyncExternalStore(subscribe, read, () => "");
  const setKey = useCallback((k: string) => {
    try {
      localStorage.setItem(KEY, k);
    } catch {}
    listeners.forEach((cb) => cb());
  }, []);
  return [key, setKey];
}
