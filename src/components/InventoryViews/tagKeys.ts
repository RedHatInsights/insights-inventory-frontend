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

export const tagColumnKey = (identity: string): string => `tag:${identity}`;

/**
 * Group a host's StructuredTag array once, by namespace and key.
 * Null and missing namespaces share the bare key. Null values are omitted.
 */
export const groupTagsByIdentity = (
  tags: StructuredTag[] | undefined,
): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};

  for (const tag of tags ?? []) {
    if (!tag.key) continue;
    const identity = tagIdentity(tag.namespace, tag.key);
    const values = grouped[identity] ?? [];
    if (tag.value != null && tag.value !== '') {
      values.push(tag.value);
    }
    grouped[identity] = values;
  }

  return grouped;
};

export const valuesForTagIdentity = (
  tagsByKey: Record<string, string[]> | undefined,
  tags: StructuredTag[] | undefined,
  identity: string,
): string[] => {
  if (tagsByKey) return tagsByKey[identity] ?? [];
  return groupTagsByIdentity(tags)[identity] ?? [];
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
