import { describe, expect, it } from "vitest";
import { readableError } from "./errors";

describe("readableError", () => {
  it("explains an unavailable or full room", () => {
    expect(readableError({ code: "permission-denied", message: "Missing or insufficient permissions." }))
      .toBe("That room is unavailable, full, or has expired.");
  });

  it("keeps Firebase validation messages visible", () => {
    expect(readableError({ code: "functions/invalid-argument", message: "functions/invalid-argument: Name must be 2 to 20 characters." }))
      .toBe("Name must be 2 to 20 characters.");
  });
});
