import { useEffect, useState } from "react";

export type Balances = { yer: number; sar: number; usd: number };
export type Customer = { name: string; phone: string };

const DEFAULT: Balances = { yer: 85400, sar: 1250, usd: 320.5 };
const BK = "jaib-balances";
const CK = "jaib-customers";
const listeners = new Set<() => void>();

function read<T>(k: string, d: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : d;
  } catch {
    return d;
  }
}

export const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function saveBalances(b: Balances) {
  localStorage.setItem(BK, JSON.stringify(b));
  listeners.forEach((l) => l());
}
export function saveCustomers(c: Customer[]) {
  localStorage.setItem(CK, JSON.stringify(c));
  listeners.forEach((l) => l());
}

export function useWallet() {
  const [balances, setB] = useState<Balances>(DEFAULT);
  const [customers, setC] = useState<Customer[]>([]);
  useEffect(() => {
    const sync = () => {
      setB(read(BK, DEFAULT));
      setC(read(CK, []));
    };
    sync();
    listeners.add(sync);
    return () => void listeners.delete(sync);
  }, []);
  const accounts = [
    { name: "ريال سعودي", amount: fmt(balances.sar) },
    { name: "ريال يمني", amount: fmt(balances.yer) },
    { name: "دولار امريكي", amount: fmt(balances.usd) },
  ];
  return { balances, customers, accounts };
}
