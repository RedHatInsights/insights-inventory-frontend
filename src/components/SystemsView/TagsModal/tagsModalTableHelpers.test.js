import {
  tagTupleToFilterStr,
  filterStrToTagTuple,
  filterStrsToSelectedTagTuples,
  normalizeToTagTuple,
  matchTagRowItems,
  selectionItemToFilterStr,
  tagToTagTuple,
} from './tagsModalTableHelpers';

describe('tagsModalTableHelpers', () => {
  describe('tagTupleToFilterStr', () => {
    it('builds namespace/key=value from tuple order [key, value, namespace]', () => {
      expect(tagTupleToFilterStr(['mykey', 'myval', 'mynamespace'])).toBe(
        'mynamespace/mykey=myval',
      );
    });
  });

  describe('filterStrToTagTuple', () => {
    it('parses standard token', () => {
      expect(filterStrToTagTuple('ns/k=v')).toEqual(['k', 'v', 'ns']);
    });
  });

  describe('filterStrsToSelectedTagTuples', () => {
    it('maps each token to a tuple', () => {
      expect(filterStrsToSelectedTagTuples(['ns/a=1', 'ns/b=2'])).toEqual([
        ['a', '1', 'ns'],
        ['b', '2', 'ns'],
      ]);
    });
  });

  describe('normalizeToTagTuple', () => {
    it('normalizes length-3 array', () => {
      expect(normalizeToTagTuple(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('coerces number and boolean cells', () => {
      expect(normalizeToTagTuple([1, true, false])).toEqual([
        '1',
        'true',
        'false',
      ]);
    });

    it('returns empty string for non-primitive cells', () => {
      expect(normalizeToTagTuple(['x', {}, 'z'])).toEqual(['x', '', 'z']);
    });

    it('normalizes DataViewTrObject-like row', () => {
      expect(normalizeToTagTuple({ row: ['k', 'v', 'ns'] })).toEqual([
        'k',
        'v',
        'ns',
      ]);
    });

    it('accepts row longer than 3', () => {
      expect(normalizeToTagTuple({ row: ['a', 'b', 'c', 'd'] })).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('returns null for wrong-length array', () => {
      expect(normalizeToTagTuple(['a', 'b'])).toBeNull();
    });

    it('returns null for short row', () => {
      expect(normalizeToTagTuple({ row: ['a', 'b'] })).toBeNull();
    });

    it('returns null for primitives', () => {
      expect(normalizeToTagTuple('x')).toBeNull();
    });

    it('returns null for plain object', () => {
      expect(normalizeToTagTuple({})).toBeNull();
    });
  });

  describe('matchTagRowItems', () => {
    it('returns true for equal tuples', () => {
      expect(matchTagRowItems(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('tuple and row object', () => {
      expect(
        matchTagRowItems(['k', 'v', 'ns'], { row: ['k', 'v', 'ns'] }),
      ).toBe(true);
    });

    it('returns false when cells differ', () => {
      expect(matchTagRowItems(['a', 'b', 'c'], ['a', 'x', 'c'])).toBe(false);
    });
  });

  describe('selectionItemToFilterStr', () => {
    it('returns filter string for valid tuple', () => {
      expect(selectionItemToFilterStr(['key', 'val', 'ns'])).toBe('ns/key=val');
    });

    it('returns empty string when invalid', () => {
      expect(selectionItemToFilterStr({})).toBe('');
    });
  });

  describe('tagToTagTuple', () => {
    it('maps StructuredTag fields', () => {
      expect(
        tagToTagTuple({
          key: 'k',
          value: 'v',
          namespace: 'ns',
        }),
      ).toEqual(['k', 'v', 'ns']);
    });

    it('uses empty string for missing fields', () => {
      expect(tagToTagTuple({})).toEqual(['', '', '']);
    });
  });
});
