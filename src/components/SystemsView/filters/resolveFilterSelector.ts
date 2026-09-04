import { inventoryFilterSpecs } from './inventory/filterDefinitions';
import type { FilterSpec } from './types';

/**
 * Selects which filters a `SystemsView` instance displays.
 * Until SystemsView accepts a consumer `filters` prop, callers use the default
 * (full inventory toolbar).
 *  @returns filter specs
 */
export type FilterSelector = () => readonly FilterSpec[];

/**
 * Default when `SystemsView` omits a filter selector: the full inventory toolbar.
 * Unlike columns, omitting filters does not mean an empty list.
 *  @returns The current inventory toolbar specs, in display order.
 */
export const defaultFilterSelector: FilterSelector = () => inventoryFilterSpecs;

/**
 * Resolves the toolbar spec list. Until SystemsView grows a consumer `filters`
 * prop, this is always the full inventory catalog.
 *
 *  @param selector - Optional selector; defaults to {@link defaultFilterSelector}
 *  @returns        Filter specs in toolbar order
 */
export const resolveFilterSelector = (
  selector: FilterSelector = defaultFilterSelector,
): readonly FilterSpec[] => selector();
