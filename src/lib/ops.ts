import { useEffect, useState } from "react";
import type { Balances } from "./wallet";

export type Op = { title: string; amount: number; cur: keyof Balances; sign: 1 | -1; date: string };
const OK = "jaib-ops";
const listeners = new Set<() => void>();

const p = (x: number) => String(x).padStart(2, "0");
export const opDate = (d: Date) => `(${p(d.getHours())}:${p(d.getMinutes())}) ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;

/** Newest first, capped at 50. */
export function pushOp(list: Op[], op: Op): Op[] {
  return [op, ...list].slice(0, 50);
}

export function readOps(): Op[] {
  try { return JSON.parse(localStorage.getItem(OK) || "[]") as Op[]; } catch { return []; }
}

export function addOp(op: Omit<Op, "date"> & { date?: string }) {
  const full: Op = { ...op, date: op.date ?? opDate(new Date()) };
  localStorage.setItem(OK, JSON.stringify(pushOp(readOps(), full)));
  listeners.forEach((l) => l());
}

export function useOps() {
  const [ops, set] = useState<Op[]>([]);
  useEffect(() => {
    const s = () => set(readOps());
    s();
    listeners.add(s);
    return () => void listeners.delete(s);
  }, []);
  return ops;
}

/** Operations whose title, amount or date contain the query. */
export function filterOps(list: Op[], q: string): Op[] {
  const s = q.trim();
  if (!s) return list;
  return list.filter((o) => o.title.includes(s) || String(o.amount).includes(s) || o.date.includes(s));
}
