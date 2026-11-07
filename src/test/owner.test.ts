import { describe, it, expect, beforeEach } from "vitest";
import { readOwner, saveOwner, firstName } from "@/lib/owner";

describe("owner", () => {
  beforeEach(() => localStorage.clear());
  it("defaults to سفيان", () => expect(readOwner()).toEqual({ name: "سفيان جميل علي محسن", phone: "773590979" }));
  it("saves new name and number", () => {
    saveOwner({ name: "أحمد علي", phone: "771234567" });
    expect(readOwner()).toEqual({ name: "أحمد علي", phone: "771234567" });
  });
  it("first name only", () => expect(firstName("أحمد علي محمد")).toBe("أحمد"));
});
