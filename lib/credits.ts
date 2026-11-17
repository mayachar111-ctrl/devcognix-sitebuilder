/** Credit prices (placeholder until the Phase 3 ledger). Kept in one place so the UI and API agree. */
export const CREDIT_COSTS = { generate: 10, edit: 1 } as const;
export type CreditAction = keyof typeof CREDIT_COSTS;
export const DEMO_CREDITS = 100;
