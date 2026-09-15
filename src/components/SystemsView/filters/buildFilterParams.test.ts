import { expect } from '@jest/globals';
import { buildFilterParams } from './buildFilterParams';
import { hostnameSpec } from './inventory/filterDefinitions';
import type { BoundFilter } from './types';

type Params = { value?: unknown };

const ctx = { lastSeenCustomRange: null };

const recordValue = (
  getValue?: BoundFilter<Params>['getValue'],
): BoundFilter<Params> => ({
  ...hostnameSpec,
  ...(getValue ? { getValue } : {}),
  updateFilterParams: (params, value) => ({ ...params, value }),
});

describe('buildFilterParams', () => {
  it('passes filters[filterId] when getValue is omitted', () => {
    expect(
      buildFilterParams([recordValue()], { hostname_or_id: 'from-url' }, ctx),
    ).toEqual({ value: 'from-url' });
  });

  it('passes getValue as-is when specified, including undefined', () => {
    expect(
      buildFilterParams(
        [recordValue(() => undefined)],
        { hostname_or_id: 'from-url' },
        ctx,
      ),
    ).toEqual({ value: undefined });
  });

  it('passes the mapped getValue instead of the filters[filterId] entry', () => {
    expect(
      buildFilterParams(
        [
          recordValue((filters, selectCtx) => ({
            key: filters.hostname_or_id,
            range: selectCtx.lastSeenCustomRange,
          })),
        ],
        { hostname_or_id: 'last24' },
        ctx,
      ),
    ).toEqual({
      value: { key: 'last24', range: null },
    });
  });
});
