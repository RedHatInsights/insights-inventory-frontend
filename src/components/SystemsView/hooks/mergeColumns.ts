type MergeableColumn = {
  key?: string | number;
  isShown?: boolean;
  isShownByDefault?: boolean;
};

/**
 * Keep the current column order and visibility, refresh definitions from
 * `incoming`, and append keys that were not already present.
 * A shown column that disappears from `incoming` stays so a refetch cannot hide it.
 */
export const mergeColumns = <T extends MergeableColumn>(
  current: readonly T[],
  incoming: readonly T[],
): readonly T[] => {
  const incomingByKey = new Map(
    incoming
      .filter((col) => col.key != null)
      .map((col) => [String(col.key), col]),
  );
  const currentKeys = new Set(
    current.filter((col) => col.key != null).map((col) => String(col.key)),
  );

  let changed = false;
  const kept = current.flatMap((col) => {
    if (col.key == null) return [col];
    const next = incomingByKey.get(String(col.key));
    if (!next) {
      changed = true;
      return col.isShown ? [col] : [];
    }
    if (next !== col) {
      changed = true;
      return [
        {
          ...next,
          isShown: col.isShown ?? next.isShown,
          isShownByDefault: col.isShownByDefault ?? next.isShownByDefault,
        },
      ];
    }
    return [col];
  });

  const added = incoming.filter(
    (col) => col.key != null && !currentKeys.has(String(col.key)),
  );
  if (added.length > 0) changed = true;

  if (!changed) return current;
  return [...kept, ...added];
};
