type MergeableColumn = {
  key?: string | number;
  isShown?: boolean;
  isShownByDefault?: boolean;
};

/**
 * Refresh column definitions after the table is already showing a column set.
 * Visibility stays with the current columns so a tag-catalog refresh can append
 * keys without replacing a saved view or the user's toggles.
 * The saved view's visibility has to be the initial list. InventoryViews waits
 * for a deep-linked view before mounting the table so this merge is not how
 * that first configuration is applied.
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
          // A later catalog must not overwrite the columns already on screen.
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
