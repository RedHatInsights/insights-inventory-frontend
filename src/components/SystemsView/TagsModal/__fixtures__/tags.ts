const createTag = (i: number) => ({
  namespace: `namespace-${i}`,
  key: `key-${i}`,
  value: `value-${i}`,
});

// Tags sample data
export const TAGS_100 = Array.from({ length: 100 }, (_, i) => createTag(i));
