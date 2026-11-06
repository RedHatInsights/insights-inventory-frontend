import type { StructuredTag } from '@redhat-cloud-services/host-inventory-client';

export type TagKeyIdentity = {
  namespace?: string | null;
  key: string;
};

/** Column and group identity: `namespace/key`, or the bare key when namespace is null. */
export const tagIdentity = (
  namespace: string | null | undefined,
  key: string,
): string => (namespace ? `${namespace}/${key}` : key);

export const TAG_COLUMN_PREFIX = 'tag:';

export const tagColumnKey = (identity: string): string =>
  `${TAG_COLUMN_PREFIX}${identity}`;

export const isTagColumnKey = (key: string): boolean =>
  key.startsWith(TAG_COLUMN_PREFIX) && key.length > TAG_COLUMN_PREFIX.length;

/** Inverse of `tagColumnKey`. A slash separates namespace from key; otherwise the key is bare. */
export const parseTagColumnKey = (
  columnKey: string,
): TagKeyIdentity | undefined => {
  if (!isTagColumnKey(columnKey)) return undefined;
  const identity = columnKey.slice(TAG_COLUMN_PREFIX.length);
  const slash = identity.indexOf('/');
  if (slash === -1) return { namespace: null, key: identity };
  const namespace = identity.slice(0, slash);
  const key = identity.slice(slash + 1);
  if (!namespace || !key) return undefined;
  return { namespace, key };
};

/**
 * Group a host's StructuredTag array once, by namespace and key.
 * Null and missing namespaces share the bare key. Null values are omitted.
 *
 * Identities are stored in a Map so a key named `constructor` or `toString`
 * is not read from Object.prototype.
 */
export const groupTagsByIdentity = (
  tags: StructuredTag[] | undefined,
): Record<string, string[]> => {
  const grouped = new Map<string, string[]>();

  for (const tag of tags ?? []) {
    if (!tag.key) continue;
    const identity = tagIdentity(tag.namespace, tag.key);
    const values = grouped.get(identity) ?? [];
    if (tag.value != null && tag.value !== '') {
      values.push(tag.value);
    }
    grouped.set(identity, values);
  }

  return Object.fromEntries(grouped);
};

const ownTagValues = (
  tagsByKey: Record<string, string[]> | undefined,
  identity: string,
): string[] => {
  if (!tagsByKey || !Object.hasOwn(tagsByKey, identity)) return [];
  const values = tagsByKey[identity];
  return Array.isArray(values) ? values : [];
};

export const valuesForTagIdentity = (
  tagsByKey: Record<string, string[]> | undefined,
  tags: StructuredTag[] | undefined,
  identity: string,
): string[] => {
  if (tagsByKey) return ownTagValues(tagsByKey, identity);
  return ownTagValues(groupTagsByIdentity(tags), identity);
};

/** One entry per namespace/key. GET /tags returns one row per full namespace/key=value. */
export const uniqueTagKeys = (
  tags: readonly { tag?: StructuredTag | null }[],
): TagKeyIdentity[] => {
  const seen = new Set<string>();
  const identities: TagKeyIdentity[] = [];

  for (const item of tags) {
    const key = item.tag?.key;
    if (!key) continue;
    const identity = tagIdentity(item.tag?.namespace, key);
    if (seen.has(identity)) continue;
    seen.add(identity);
    identities.push({ namespace: item.tag?.namespace ?? null, key });
  }

  return identities;
};

/** Catalog entries the user can still add, filtered by namespace, key, or `namespace/key`. */
export const matchingTagIdentities = (
  tags: readonly { tag?: StructuredTag | null }[],
  search: string,
  takenColumnKeys: ReadonlySet<string>,
): TagKeyIdentity[] => {
  const query = search.trim().toLowerCase();

  return uniqueTagKeys(tags).filter((identity) => {
    const columnKey = tagColumnKey(
      tagIdentity(identity.namespace, identity.key),
    );
    if (takenColumnKeys.has(columnKey)) return false;
    if (!query) return true;
    const label = tagIdentity(identity.namespace, identity.key).toLowerCase();
    const namespace = (identity.namespace ?? '').toLowerCase();
    return (
      label.includes(query) ||
      namespace.includes(query) ||
      identity.key.toLowerCase().includes(query)
    );
  });
};
