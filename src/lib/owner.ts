import { useEffect, useState } from "react";

export type Owner = { name: string; phone: string };
export const DEFAULT_OWNER: Owner = { name: "سفيان جميل علي محسن", phone: "773590979" };
const K = "jaib-owner";
const listeners = new Set<() => void>();

export function readOwner(): Owner {
  try {
    const v = localStorage.getItem(K);
    return v ? { ...DEFAULT_OWNER, ...(JSON.parse(v) as Owner) } : DEFAULT_OWNER;
  } catch {
    return DEFAULT_OWNER;
  }
}

export function saveOwner(o: Owner) {
  localStorage.setItem(K, JSON.stringify({ name: o.name.trim(), phone: o.phone.trim() }));
  listeners.forEach((l) => l());
}

export const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? "";

export function useOwner() {
  const [o, setO] = useState<Owner>(DEFAULT_OWNER);
  useEffect(() => {
    const sync = () => setO(readOwner());
    sync();
    listeners.add(sync);
    return () => void listeners.delete(sync);
  }, []);
  return o;
}
