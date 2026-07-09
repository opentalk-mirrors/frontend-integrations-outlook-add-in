import { describe, expect, it } from "vitest";
import { getEnvBool } from "./helpers";

describe("getEnvBool", () => {
  it.each(["1", "t", "T", "true", "TRUE", "True", "  true  "])("returns true for %j", (value) => {
    expect(getEnvBool(value)).toBe(true);
  });

  it.each(["0", "f", "false", "FALSE", "no", "yes", "", "random"])(
    "returns false for %j",
    (value) => {
      expect(getEnvBool(value)).toBe(false);
    }
  );

  it("returns false for undefined and null", () => {
    expect(getEnvBool(undefined)).toBe(false);
    expect(getEnvBool(null)).toBe(false);
  });
});
