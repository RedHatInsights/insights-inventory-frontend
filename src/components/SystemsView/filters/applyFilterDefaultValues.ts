import type { FilterSelector } from './resolveFilterSelector';
import type { FilterSpec } from './types';

/**
 * Returns a selector that copies each bound filter and stamps `defaultValue`
 * from `defaults` when that `filterId` is present. Does not mutate catalog
 * modules or the original selector results.
 *
 *  @param selector - Bound-filter selector to wrap
 *  @param defaults - Applied UI values keyed by `filterId`
 *  @returns        Selector that yields copies with stamped `defaultValue`
 */
export const applyFilterDefaultValues = <TQuery>(
  selector: FilterSelector<TQuery>,
  defaults: Readonly<Record<string, FilterSpec['defaultValue'] | undefined>>,
): FilterSelector<TQuery> => {
  return (catalog) =>
    selector(catalog).map((spec) => {
      const stamped = defaults[spec.filterId];
      return stamped !== undefined ? { ...spec, defaultValue: stamped } : spec;
    });
};
