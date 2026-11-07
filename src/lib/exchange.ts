import type { Balances } from "./wallet";
import type { Cur } from "./transfer";

/** Price of one unit in Yemeni rials. */
export const RATES: Record<Cur, { buy: number; sell: number }> = {
  yer: { buy: 1, sell: 1 },
  sar: { buy: 139, sell: 140 },
  usd: { buy: 530, sell: 535 },
};

/** Amount taken from `from` to receive `amount` in `to`. */
export function exchangeCost(from: Cur, to: Cur, amount: number) {
  return Math.round(((amount * RATES[to].sell) / RATES[from].buy) * 100) / 100;
}

/** New balances after exchange, or null when invalid / insufficient. */
export function exchange(b: Balances, from: Cur, to: Cur, amount: number): Balances | null {
  if (from === to || !(amount > 0)) return null;
  const cost = exchangeCost(from, to, amount);
  if (cost > b[from]) return null;
  return { ...b, [from]: Math.round((b[from] - cost) * 100) / 100, [to]: Math.round((b[to] + amount) * 100) / 100 };
}

export type Pkg = { label: string; price: number };
export const PACKAGES: Record<string, Pkg[]> = {
  "sabafon-pkg": [{ label: "22.5 وحده", price: 273 }, { label: "45 وحده", price: 546 }, { label: "90 وحده", price: 1092 }],
  "you-pkg": [{ label: "كرت 410", price: 497 }, { label: "كرت 820", price: 994 }],
  "you-bill": [{ label: "410", price: 497 }, { label: "820", price: 994 }],
};
