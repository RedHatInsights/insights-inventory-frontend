export const applyUrlOverrides = (
  base: URLSearchParams,
  overrides: URLSearchParams,
): URLSearchParams => {
  const result = new URLSearchParams(base);
  for (const key of new Set(overrides.keys())) {
    result.delete(key);
  }
  for (const [key, value] of overrides.entries()) {
    result.append(key, value);
  }
  return result;
};
