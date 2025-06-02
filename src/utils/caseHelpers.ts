function toCamelCase(str: string): string {
  return str.replace(/[_-](\w)/g, (_, c) => c.toUpperCase());
}

export function toCamelCaseKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(toCamelCaseKeys) as T;
  } else if (input !== null && typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const camelKey = toCamelCase(key);
        result[camelKey] = toCamelCaseKeys(input[key]);
      }
    }
    return result as T;
  }
  return input;
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .replace(/-/g, "_")
    .toLowerCase();
}

export function toSnakeCaseKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(toSnakeCaseKeys) as T;
  } else if (input !== null && typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const snakeKey = toSnakeCase(key);
        result[snakeKey] = toSnakeCaseKeys(input[key]);
      }
    }
    return result as T;
  }
  return input;
}
