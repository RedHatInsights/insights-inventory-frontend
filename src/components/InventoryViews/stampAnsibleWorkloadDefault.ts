import type { FilterSelector } from '../SystemsView/filters/resolveFilterSelector';
import { isEmptyFilterValue } from '../SystemsView/filters/defaultValuesFrom';

export const ANSIBLE_WORKLOAD = 'ansible';

/**
 * Ansible bundle default: stamp `workloads` to `['ansible']` when the
 * selector still has the catalog empty default.
 *
 *  @param selector - Bound-filter selector to wrap
 *  @returns        Selector with ansible stamped on empty workloads
 */
export const selectAnsibleWorkload = <TFilterParams>(
  selector: FilterSelector<TFilterParams>,
): FilterSelector<TFilterParams> => {
  return (catalog) =>
    selector(catalog).map((spec) =>
      spec.filterId === 'workloads' && isEmptyFilterValue(spec.defaultValue)
        ? { ...spec, defaultValue: [ANSIBLE_WORKLOAD] }
        : spec,
    );
};
