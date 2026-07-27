import { useCallback, useEffect, useState } from "react";

/**
 * Tiny localStorage-backed state hook.
 * v0.1 has no backend: everything the user edits lives in the browser only.
 */
export function useLocalStore<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt payloads */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked */
    }
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return { value, setValue, hydrated, reset } as const;
}

export const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
