/* Maps toolbar system-type values to API `systemType` params. */
export const buildSystemType = <T extends string>(
  values: string[],
  validValues: readonly T[],
): T[] =>
  values
    .map((val) => (val === 'image' ? ['bootc', 'edge'] : val))
    .flat()
    .filter((val): val is T => validValues.includes(val as T));
