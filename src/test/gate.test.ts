import { describe, expect, it } from "vitest";
import { checkPassword } from "@/lib/gate";

describe("login password", () => {
  it("accepts 7735909", async () => expect(await checkPassword("7735909")).toBe(true));
  it("rejects the old 7735", async () => expect(await checkPassword("7735")).toBe(false));
});
