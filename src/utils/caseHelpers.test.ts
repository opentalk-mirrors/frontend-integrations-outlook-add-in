import { describe, expect, it } from "vitest";
import { toCamelCaseKeys, toSnakeCaseKeys } from "./caseHelpers";

describe("toCamelCaseKeys", () => {
  it("converts snake_case keys to camelCase", () => {
    expect(toCamelCaseKeys({ first_name: "a", last_name: "b" })).toEqual({
      firstName: "a",
      lastName: "b",
    });
  });

  it("converts kebab-case keys to camelCase", () => {
    expect(toCamelCaseKeys({ "some-key": 1 })).toEqual({ someKey: 1 });
  });

  it("recurses into nested objects and arrays", () => {
    expect(
      toCamelCaseKeys({
        outer_key: { inner_key: [{ deep_key: 1 }] },
      })
    ).toEqual({ outerKey: { innerKey: [{ deepKey: 1 }] } });
  });

  it("leaves primitives untouched", () => {
    expect(toCamelCaseKeys("plain")).toBe("plain");
    expect(toCamelCaseKeys(42)).toBe(42);
    expect(toCamelCaseKeys(null)).toBeNull();
  });
});

describe("toSnakeCaseKeys", () => {
  it("converts camelCase keys to snake_case", () => {
    expect(toSnakeCaseKeys({ firstName: "a", lastName: "b" })).toEqual({
      first_name: "a",
      last_name: "b",
    });
  });

  it("converts kebab-case keys to snake_case", () => {
    expect(toSnakeCaseKeys({ "some-key": 1 })).toEqual({ some_key: 1 });
  });

  it("recurses into nested objects and arrays", () => {
    expect(
      toSnakeCaseKeys({
        outerKey: { innerKey: [{ deepKey: 1 }] },
      })
    ).toEqual({ outer_key: { inner_key: [{ deep_key: 1 }] } });
  });

  it("is the inverse of toCamelCaseKeys for round-trips", () => {
    const original = { first_name: "a", nested_value: { deep_key: 1 } };
    expect(toSnakeCaseKeys(toCamelCaseKeys(original))).toEqual(original);
  });
});
