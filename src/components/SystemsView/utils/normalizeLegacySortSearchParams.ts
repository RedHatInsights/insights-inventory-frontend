export interface NormalizeLegacySortSearchParamsOptions {
  sortParam?: string;
  directionParam?: string;
}

/**
 * Converts legacy inventory sort URLs (`sort` only, with optional leading `-` for desc)
 * into the shape expected by PatternFly `useDataViewSort` (`sort` + `direction`).
 * leading `-` means descending; hyphens inside the key do not.
 *
 *  @param params  - Current query string.
 *  @param options - Optional `sortParam` / `directionParam` overrides.
 *  @returns       Cloned params with legacy `sort` expanded when applicable.
 */
export function normalizeLegacySortSearchParams(
  params: URLSearchParams,
  options?: NormalizeLegacySortSearchParamsOptions,
): URLSearchParams {
  const sortParam = options?.sortParam ?? 'sort';
  const directionParam = options?.directionParam ?? 'direction';
  const emptyParams = new URLSearchParams(params);

  const rawSort = params.get(sortParam);
  if (!rawSort) {
    return emptyParams;
  }
  if (params.has(directionParam)) {
    return emptyParams;
  }

  const legacyDesc = rawSort.startsWith('-');
  const key = legacyDesc ? rawSort.slice(1) : rawSort;
  if (!key) {
    return emptyParams;
  }
  const direction = legacyDesc ? 'desc' : 'asc';

  const next = new URLSearchParams(params);
  next.set(sortParam, key);
  next.set(directionParam, direction);
  return next;
}
