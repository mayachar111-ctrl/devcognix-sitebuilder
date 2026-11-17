"use client";
import { useCallback, useEffect, useState } from "react";
import { DEMO_CREDITS, type CreditAction } from "@/lib/credits";

/**
 * Demo credit wallet kept in localStorage. Placeholder for the Phase 3
 * CreditLedger: each spend is also recorded locally in the same shape
 * (delta, reason, siteId, at) so it can be replayed into the DB later.
 */
const KEY = "dc-credits:v1";
const LEDGER = "dc-credit-ledger:v1";
const EVT = "dc-credits-change";

function read(): number {
  const v = Number(localStorage.getItem(KEY));
  return localStorage.getItem(KEY) === null || !Number.isFinite(v) ? DEMO_CREDITS : v;
}

export function useCredits() {
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    const sync = () => setBalance(read());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(EVT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVT, sync);
    };
  }, []);
  const spend = useCallback((amount: number, reason: CreditAction, siteId?: string) => {
    if (amount <= 0) return;
    const next = Math.max(0, read() - amount);
    localStorage.setItem(KEY, String(next));
    try {
      const ledger = JSON.parse(localStorage.getItem(LEDGER) ?? "[]");
      ledger.unshift({ delta: -amount, reason, siteId, at: new Date().toISOString() });
      localStorage.setItem(LEDGER, JSON.stringify(ledger.slice(0, 200)));
    } catch {}
    window.dispatchEvent(new Event(EVT));
  }, []);
  const reset = useCallback(() => {
    localStorage.setItem(KEY, String(DEMO_CREDITS));
    window.dispatchEvent(new Event(EVT));
  }, []);
  return { balance, spend, reset, canAfford: (n: number) => balance === null || balance >= n };
}

export function CreditsPill({ className = "" }: { className?: string }) {
  const { balance, reset } = useCredits();
  return (
    <button
      type="button"
      onClick={() => {
        if (balance !== null && balance < 20 && confirm("Top up to 100 demo credits?")) reset();
      }}
      title="Demo credits · AI site generation costs 10, each AI edit costs 1"
      className={`inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
      <span data-testid="credits">{balance ?? "…"}</span> credits
    </button>
  );
}
