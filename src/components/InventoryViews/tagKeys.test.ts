import {
  groupTagsByIdentity,
  matchingTagIdentities,
  parseTagColumnKey,
  tagColumnKey,
  tagIdentity,
  uniqueTagKeys,
  valuesForTagIdentity,
} from './tagKeys';

describe('tag keys', () => {
  it('groups multi-value tags and ignores null values', () => {
    expect(
      groupTagsByIdentity([
        { namespace: 'insights-client', key: 'env', value: 'prod' },
        { namespace: 'insights-client', key: 'env', value: 'stage' },
        { namespace: 'insights-client', key: 'present', value: null },
      ]),
    ).toEqual({
      'insights-client/env': ['prod', 'stage'],
      'insights-client/present': [],
    });
  });

  it('groups a null namespace with the bare key', () => {
    expect(
      groupTagsByIdentity([
        { namespace: null, key: 'owner', value: 'alice' },
        { key: 'owner', value: 'bob' },
      ]),
    ).toEqual({
      owner: ['alice', 'bob'],
    });
  });

  it('groups keys that match inherited object properties', () => {
    const tags = [
      { namespace: null, key: 'constructor', value: 'yes' },
      { namespace: null, key: 'toString', value: 'text' },
    ];

    expect(groupTagsByIdentity(tags)).toEqual({
      constructor: ['yes'],
      toString: ['text'],
    });
    expect(valuesForTagIdentity(undefined, tags, 'constructor')).toEqual([
      'yes',
    ]);
    expect(valuesForTagIdentity({}, undefined, 'toString')).toEqual([]);
    expect(valuesForTagIdentity({}, undefined, 'constructor')).toEqual([]);
  });

  it('keeps the same key in two namespaces distinct', () => {
    expect(
      groupTagsByIdentity([
        { namespace: 'insights-client', key: 'env', value: 'prod' },
        { namespace: 'satellite', key: 'env', value: 'stage' },
      ]),
    ).toEqual({
      'insights-client/env': ['prod'],
      'satellite/env': ['stage'],
    });
  });

  it('dedupes the tag catalog to namespace and key', () => {
    const identities = uniqueTagKeys([
      { tag: { namespace: 'insights-client', key: 'env', value: 'prod' } },
      { tag: { namespace: 'insights-client', key: 'env', value: 'stage' } },
      { tag: { namespace: null, key: 'owner', value: 'alice' } },
      { tag: { namespace: 'satellite', key: 'env', value: 'stage' } },
    ]);

    expect(identities).toEqual([
      { namespace: 'insights-client', key: 'env' },
      { namespace: null, key: 'owner' },
      { namespace: 'satellite', key: 'env' },
    ]);
    expect(
      identities.map((identity) =>
        tagColumnKey(tagIdentity(identity.namespace, identity.key)),
      ),
    ).toEqual(['tag:insights-client/env', 'tag:owner', 'tag:satellite/env']);
  });

  it('parses a stored tag column key', () => {
    expect(parseTagColumnKey('tag:insights-client/env')).toEqual({
      namespace: 'insights-client',
      key: 'env',
    });
    expect(parseTagColumnKey('tag:owner')).toEqual({
      namespace: null,
      key: 'owner',
    });
    expect(parseTagColumnKey('display_name')).toBeUndefined();
    expect(parseTagColumnKey('tag:')).toBeUndefined();
  });

  it('matches tag search on namespace and key, excluding columns already added', () => {
    const tags = [
      {
        tag: {
          namespace: 'insights-client',
          key: 'environment',
          value: 'prod',
        },
      },
      { tag: { namespace: 'satellite', key: 'environment', value: 'stage' } },
      { tag: { namespace: 'satellite', key: 'owner', value: 'alice' } },
    ];

    expect(
      matchingTagIdentities(tags, 'environment', new Set()).map(
        (identity) => identity.namespace,
      ),
    ).toEqual(['insights-client', 'satellite']);
    expect(
      matchingTagIdentities(tags, 'satellite', new Set()).map(
        (identity) => identity.key,
      ),
    ).toEqual(['environment', 'owner']);
    expect(
      matchingTagIdentities(tags, '', new Set(['tag:satellite/owner'])).map(
        (identity) => tagIdentity(identity.namespace, identity.key),
      ),
    ).toEqual(['insights-client/environment', 'satellite/environment']);
  });
});
