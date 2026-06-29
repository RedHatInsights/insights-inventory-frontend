import { expect } from '@jest/globals';
import { buildSystemType } from './buildSystemType';

enum TestSystemType {
  Conventional = 'conventional',
  Bootc = 'bootc',
  Edge = 'edge',
}

describe('buildSystemType', () => {
  it('expands image to bootc and edge', () => {
    expect(buildSystemType(['image'], Object.values(TestSystemType))).toEqual([
      TestSystemType.Bootc,
      TestSystemType.Edge,
    ]);
  });

  it('filters out invalid values', () => {
    expect(
      buildSystemType(
        ['conventional', 'invalid', 'image'],
        Object.values(TestSystemType),
      ),
    ).toEqual([
      TestSystemType.Conventional,
      TestSystemType.Bootc,
      TestSystemType.Edge,
    ]);
  });
});
