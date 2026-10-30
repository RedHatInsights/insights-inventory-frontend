import {
  groupTagsByIdentity,
  tagColumnKey,
  tagIdentity,
  uniqueTagKeys,
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
});
