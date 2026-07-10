"use client";

import { useCallback, useState } from "react";

export interface ConfirmController<T> {
  /** Item pending confirmation, or null when the dialog is closed. */
  item: T | null;
  isOpen: boolean;
  isPending: boolean;
  ask: (item: T) => void;
  cancel: () => void;
  confirm: () => Promise<void>;
}

/**
 * Generic confirmation flow: `ask(item)` opens the dialog, `confirm()` runs
 * the callback and closes only if it resolves to true.
 */
export function useConfirm<T>(
  onConfirm: (item: T) => Promise<boolean> | boolean
): ConfirmController<T> {
  const [item, setItem] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);

  const ask = useCallback((next: T) => setItem(next), []);
  const cancel = useCallback(() => setItem(null), []);

  const confirm = useCallback(async () => {
    if (item === null) return;
    setIsPending(true);
    try {
      const ok = await onConfirm(item);
      if (ok) setItem(null);
    } finally {
      setIsPending(false);
    }
  }, [item, onConfirm]);

  return { item, isOpen: item !== null, isPending, ask, cancel, confirm };
}
