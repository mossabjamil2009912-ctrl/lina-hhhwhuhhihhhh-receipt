import { describe, expect, it } from "vitest";
import { opDate, pushOp, type Op } from "@/lib/ops";

const op = (amount: number, sign: 1 | -1): Op => ({ title: "تحويل مشترك", amount, cur: "yer", sign, date: "x" });

describe("operations list", () => {
  it("puts the newest operation first", () => {
    const l = pushOp(pushOp([], op(50, -1)), op(100, 1));
    expect(l.map((o) => o.amount)).toEqual([100, 50]);
  });
  it("keeps money out negative and money in positive", () => {
    const l = pushOp(pushOp([], op(50, -1)), op(100, 1));
    expect(l[1]!.sign).toBe(-1);
    expect(l[0]!.sign).toBe(1);
  });
  it("formats date like (09:43) 22/10/2026", () => {
    expect(opDate(new Date(2026, 9, 22, 9, 43))).toBe("(09:43) 22/10/2026");
  });
});

import { filterOps } from "@/lib/ops";
describe("filterOps", () => {
  const list = [
    { title: "شحن رصيد", amount: 500, cur: "yer" as const, sign: -1 as const, date: "(10:00) 22/10/2026" },
    { title: "مصارفة", amount: 10, cur: "sar" as const, sign: 1 as const, date: "(11:00) 21/10/2026" },
  ];
  it("finds by title", () => expect(filterOps(list, "شحن").length).toBe(1));
  it("finds by amount", () => expect(filterOps(list, "500")[0]!.title).toBe("شحن رصيد"));
  it("empty query returns all", () => expect(filterOps(list, " ").length).toBe(2));
});
