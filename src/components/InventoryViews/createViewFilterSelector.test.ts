import { expect } from '@jest/globals';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import { filterCatalog } from '../SystemsView/filters/catalog';
import {
  hostnameSpec,
  inventoryFilterSpecs,
  workloadsSpec,
} from '../SystemsView/filters/inventory/filterDefinitions';
import { createViewFilterSelector } from './createViewFilterSelector';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';

describe('createViewFilterSelector', () => {
  it('returns undefined when configuration is undefined', () => {
    expect(createViewFilterSelector(undefined)).toBeUndefined();
  });

  it('keeps full inventory membership when the view has no saved filters', () => {
    const selector = createViewFilterSelector({ columns: [] });
    expect(selector).toBe(selectInventoryViewsFilters);

    const result = selector!(filterCatalog);
    expect(result.map((spec) => spec.filterId)).toEqual(
      inventoryFilterSpecs.map((spec) => spec.filterId),
    );
    expect(
      result.find((spec) => spec.filterId === 'hostname_or_id')?.defaultValue,
    ).toBe('');
  });

  it('adds saved UI values onto defaultValue copies', () => {
    const configuration = {
      columns: [],
      filters: {
        host: { hostname_or_id: 'web-01' },
        system_profile: {
          workloads: { ansible: { is: 'not_nil' } },
        },
      },
    } as unknown as ViewConfiguration;

    const result = createViewFilterSelector(configuration)!(filterCatalog);

    expect(
      result.find((spec) => spec.filterId === 'hostname_or_id')?.defaultValue,
    ).toBe('web-01');
    expect(
      result.find((spec) => spec.filterId === 'workloads')?.defaultValue,
    ).toEqual(['ansible']);
    expect(
      result.find((spec) => spec.filterId === 'status')?.defaultValue,
    ).toEqual([]);
  });

  it('does not mutate catalog modules', () => {
    const configuration = {
      columns: [],
      filters: {
        host: { hostname_or_id: 'web-01' },
      },
    } as unknown as ViewConfiguration;

    createViewFilterSelector(configuration)!(filterCatalog);

    expect(hostnameSpec.defaultValue).toBe('');
    expect(workloadsSpec.defaultValue).toEqual([]);
  });
});
