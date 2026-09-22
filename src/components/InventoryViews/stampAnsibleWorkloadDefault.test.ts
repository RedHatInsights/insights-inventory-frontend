import { expect } from '@jest/globals';
import { filterCatalog } from '../SystemsView/filters/catalog';
import {
  hostnameSpec,
  workloadsSpec,
} from '../SystemsView/filters/inventory/filterDefinitions';
import { selectInventoryViewsFilters } from './selectInventoryViewsFilters';
import { selectAnsibleWorkload } from './stampAnsibleWorkloadDefault';

describe('stampAnsibleWorkloadDefault', () => {
  it('stamps workloads to ansible when the selector still has the catalog empty default', () => {
    const stamped = selectAnsibleWorkload(selectInventoryViewsFilters)(
      filterCatalog,
    );

    expect(
      stamped.find((spec) => spec.filterId === 'workloads')?.defaultValue,
    ).toEqual(['ansible']);
    expect(workloadsSpec.defaultValue).toEqual([]);
  });

  it('does not overwrite a view-stamped workloads defaultValue', () => {
    const fromView: typeof selectInventoryViewsFilters = (catalog) =>
      selectInventoryViewsFilters(catalog).map((spec) =>
        spec.filterId === 'workloads'
          ? { ...spec, defaultValue: ['sap'] }
          : spec,
      );

    const stamped = selectAnsibleWorkload(fromView)(filterCatalog);

    expect(
      stamped.find((spec) => spec.filterId === 'workloads')?.defaultValue,
    ).toEqual(['sap']);
  });

  it('does not mutate catalog specs', () => {
    selectAnsibleWorkload(selectInventoryViewsFilters)(filterCatalog);
    expect(hostnameSpec.defaultValue).toBe('');
    expect(workloadsSpec.defaultValue).toEqual([]);
  });
});
