import type { ToolbarLabel } from '@patternfly/react-core';
import type { LastSeenKey } from '../constants';
import type { LastSeenCustomRange, SystemsViewFilterState } from '../types';
import type { Resolve } from '../../../types/utility-types';
import type { DataViewCustomFilterProps } from './DataViewCustomFilter';

export type FilterOption = {
  /** Filter option label */
  label: React.ReactNode;
  /** Filter option value */
  value: string;
};

/**
 * Extra state `selectValue` may read that is not on the URL UI bag
 * (last-seen custom dates stay off the URL).
 */
export type FilterSelectContext = {
  lastSeenCustomRange: LastSeenCustomRange;
};

/**
 * Fold value for last seen: URL/UI still stores `LastSeenKey`, while
 * `updateFilterParams` later receives key plus the in-memory custom range.
 */
export type LastSeenSelectValue = {
  key: LastSeenKey | '';
  range: LastSeenCustomRange;
};

type FilterIdentity = {
  filterId: string;
  title: string;
  /** When set, SystemsView debounces this key in the fetch */
  debounceMs?: number;
  /**
   * Maps the URL/UI bag plus extra context to the value the later
   * `updateFilterParams` fold should see. When set, that return value is
   * used as-is (including `undefined`). When omitted, the fold uses
   * `filters[filterId]`.
   */
  getValue?: (
    filters: SystemsViewFilterState,
    ctx: FilterSelectContext,
  ) => unknown;
};

/**
 * Consumer adapter passed to `bindFilter`, named catalog factories, and `catalog.custom`
 * while `TValue` is still known.
 */
export type FilterBinding<
  TFilterParams,
  TValue,
  TFilterProps extends object = Record<string, never>,
> = {
  updateFilterParams: (params: TFilterParams, value: TValue) => TFilterParams;
  /** Extra props forwarded to a custom filter component. */
  filterProps?: TFilterProps;
};

export type TextFilterSpec = FilterIdentity & {
  type: 'text';
  /** Starting value and clear target for this key */
  defaultValue: string;
  chipTitle?: string;
  placeholder?: string;
};

export type CheckboxFilterSpec = FilterIdentity & {
  type: 'checkbox';
  /** Starting value and clear target for this key */
  defaultValue: string[];
  placeholder?: string;
  options: FilterOption[];
};

export type SingleSelectFilterSpec = FilterIdentity & {
  type: 'single-select';
  /** Starting value and clear target for this key */
  defaultValue: string[];
  placeholder?: string;
  options: FilterOption[];
};

export type CustomFilterSpec<
  TValue extends string | string[] = string | string[],
> = FilterIdentity & {
  type: 'custom';
  /** Starting value and clear target for this key */
  defaultValue: TValue;
  placeholder?: string;
  ouiaId?: string;
  isMultiGroup?: boolean;
  filterComponent: DataViewCustomFilterProps<TValue>['filterComponent'];
  createLabel: DataViewCustomFilterProps<TValue>['createLabel'];
  deleteLabel?: DataViewCustomFilterProps<TValue>['deleteLabel'];
};

export type FilterSpec =
  | TextFilterSpec
  | CheckboxFilterSpec
  | SingleSelectFilterSpec
  | CustomFilterSpec<string[]>
  | CustomFilterSpec<LastSeenKey | ''>;

/**
 * Runtime toolbar filter. `TValue` is erased so mixed-filter arrays type-check;
 * `TFilterParams` stays so every filter in a view writes the same params type.
 */
export type BoundFilter<TFilterParams = unknown> = Resolve<
  FilterSpec & {
    updateFilterParams: (
      params: TFilterParams,
      value: unknown,
    ) => TFilterParams;
  }
>;

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;
