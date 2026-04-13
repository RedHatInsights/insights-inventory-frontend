import { expect } from '@jest/globals';
import {
  buildWorkloadsFilter,
  WORKLOAD_FILTER_OPTIONS,
} from './workloadsFilter';

const NOT_NIL = { is: 'not_nil' as const };

function presenceFilterForKeys(keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, NOT_NIL]));
}

describe('buildWorkloadsFilter', () => {
  it('returns undefined for empty or undefined input', () => {
    expect(buildWorkloadsFilter(undefined)).toBeUndefined();
    expect(buildWorkloadsFilter([])).toBeUndefined();
  });

  it('when every toolbar workload is selected, includes one not_nil entry per known workload key', () => {
    const allKeys = WORKLOAD_FILTER_OPTIONS.map((o) => o.value);
    expect(buildWorkloadsFilter([...allKeys])).toEqual(
      presenceFilterForKeys([...allKeys]),
    );
  });

  it('preserves selection order in the filter object key order', () => {
    const keys = ['sap', 'ansible', 'mssql'];
    expect(Object.keys(buildWorkloadsFilter(keys)!)).toEqual(keys);
  });
});
