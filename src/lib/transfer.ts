import type { Balances } from "./wallet";

export type Cur = keyof Balances;
export const curName: Record<Cur, string> = { yer: "ريال يمني", sar: "ريال سعودي", usd: "دولار امريكي" };

/** Returns new balances after deducting, or null when funds are insufficient/invalid. */
export function deduct(b: Balances, cur: Cur, amount: number): Balances | null {
  if (!(amount > 0) || amount > b[cur]) return null;
  return { ...b, [cur]: Math.round((b[cur] - amount) * 100) / 100 };
}

const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

function below1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) parts.push(hundreds[Math.floor(n / 100)]!);
  const r = n % 100;
  if (r > 0 && r < 20) parts.push(ones[r]!);
  else if (r >= 20) {
    if (r % 10) parts.push(ones[r % 10]!);
    parts.push(tens[Math.floor(r / 10)]!);
  }
  return parts.join(" و");
}

export function toWords(n: number): string {
  n = Math.floor(n);
  if (n === 0) return "صفر";
  const scales: [number, string, string, string][] = [
    [1e6, "مليون", "مليونان", "ملايين"],
    [1e3, "ألف", "ألفان", "آلاف"],
  ];
  const out: string[] = [];
  for (const [v, one, two, many] of scales) {
    const q = Math.floor(n / v);
    if (q) {
      out.push(q === 1 ? one : q === 2 ? two : q <= 10 ? `${below1000(q)} ${many}` : `${below1000(q)} ${one}`);
      n %= v;
    }
  }
  if (n) out.push(below1000(n));
  return out.join(" و");
}

export const REF_PREFIX = "179327445095";
/** Reference number: fixed prefix, only the last 2 digits change. */
export function makeRef(rand: () => number = Math.random): string {
  return REF_PREFIX + String(Math.floor(rand() * 100)).padStart(2, "0");
}

/** Returns new balances after adding funds to one account, or null for invalid amounts. */
export function deposit(b: Balances, cur: Cur, amount: number): Balances | null {
  if (!(amount > 0)) return null;
  return { ...b, [cur]: Math.round((b[cur] + amount) * 100) / 100 };
}
