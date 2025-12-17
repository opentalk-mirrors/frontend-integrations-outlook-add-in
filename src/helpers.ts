/**
 * Parses an environment variable string into a boolean following Kubernetes/Go conventions.
 * * Returns `true` for: "1", "t", "T", "true", "TRUE", "True"
 * Returns `false` for: everything else (including undefined/null)
 */
export const getEnvBool = (value: string | undefined | null): boolean => {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "t";
};
