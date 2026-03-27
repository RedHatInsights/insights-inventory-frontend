const createTag = (i: number) => ({
  namespace: `namespace-${i}`,
  key: `key-${i}`,
  value: `value-${i}`,
});

// Tags sample data
export const TAGS_100 = Array.from({ length: 100 }, (_, i) => createTag(i));

/** Subset for table/modal tests (same shape as `TAGS_100`). */
export const TAGS_SAMPLE = TAGS_100.slice(0, 2);

/** Toolbar/API filter token for `TAGS_100[0]` (namespace/key=value). */
export const FIRST_TAG_FILTER_TOKEN = `${TAGS_100[0].namespace}/${TAGS_100[0].key}=${TAGS_100[0].value}`;
