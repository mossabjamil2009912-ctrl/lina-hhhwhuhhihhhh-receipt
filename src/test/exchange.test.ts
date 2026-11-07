import { describe, it, expect } from "vitest";
import { exchange, exchangeCost } from "@/lib/exchange";

const b = { yer: 10000, sar: 10, usd: 0 };
describe("exchange", () => {
  it("10 SAR costs 1400 YER", () => expect(exchangeCost("yer", "sar", 10)).toBe(1400));
  it("moves money between my accounts", () => expect(exchange(b, "yer", "sar", 10)).toEqual({ yer: 8600, sar: 20, usd: 0 }));
  it("rejects when balance too low", () => expect(exchange(b, "yer", "usd", 100)).toBeNull());
  it("rejects same account", () => expect(exchange(b, "yer", "yer", 5)).toBeNull());
});
