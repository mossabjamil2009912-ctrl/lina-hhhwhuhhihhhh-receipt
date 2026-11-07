import { describe, it, expect } from "vitest";
import { deduct, deposit, makeRef, toWords } from "@/lib/transfer";

const b = { yer: 85400, sar: 1250, usd: 320.5 };

describe("transfer", () => {
  it("deducts the amount from the chosen account only", () => {
    expect(deduct(b, "yer", 50)).toEqual({ yer: 85350, sar: 1250, usd: 320.5 });
  });
  it("rejects amounts larger than the balance", () => {
    expect(deduct(b, "usd", 400)).toBeNull();
  });
  it("writes 50 as خمسون", () => {
    expect(toWords(50)).toBe("خمسون");
  });
  it("reference keeps 179327445095 and changes only the last 2 digits", () => {
    expect(makeRef(() => 0.11)).toBe("17932744509511");
    expect(makeRef(() => 0.05)).toBe("17932744509505");
    expect(makeRef(() => 0.999)).toBe("17932744509599");
  });
  it("deposit adds to the chosen account only", () => {
    expect(deposit(b, "sar", 100)).toEqual({ yer: 85400, sar: 1350, usd: 320.5 });
    expect(deposit(b, "sar", 0)).toBeNull();
  });
});
