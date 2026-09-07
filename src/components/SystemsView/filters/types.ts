import type { ReactNode } from 'react';
import type { ToolbarLabel } from '@patternfly/react-core';
import {
  ApiHostGetHostListRegisteredWithEnum,
  ApiHostGetHostListStalenessEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { LastSeenKey } from '../constants';
import type { LastSeenCustomRange, SystemsViewFilterState } from '../types';
import type { Resolve } from '../../../types/utility-types';
import type { DataViewCustomFilterProps } from './DataViewCustomFilter';

type CheckboxOption = { label: ReactNode; value: string };

/** Toolbar filters for SystemsView. Keys match `FilterSpec.filterId`. */
export type InventoryFilters = {
  hostname_or_id: string;
  status: ApiHostGetHostListStalenessEnum[];
  source: ApiHostGetHostListRegisteredWithEnum[];
  rhcStatus: string[];
  system_type: string[];
  group_id: string[];
  tags: string[];
  operating_system: string[];
  workloads: string[];
  last_seen: LastSeenKey | '';
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
 * `updateQuery` later receives key plus the in-memory custom range.
 */
export type LastSeenSelectValue = {
  key: LastSeenKey | '';
  range: LastSeenCustomRange;
};

type FilterIdentity = {
  filterId: string;
  title: string;
  /** Empty value for this key (reset, initial merge, URL sync). */
  emptyValue: string | string[];
  /** When set, SystemsView debounces this key in the fetch */
  debounceMs?: number;
  /**
   * Maps the URL/UI bag plus extra context to the value the later
   * `updateQuery` fold should see. Defaults to `filters[filterId]`.
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
export type FilterBinding<TQuery, TValue> = {
  updateQuery: (query: TQuery, value: TValue) => TQuery;
};

export type TextFilterSpec = FilterIdentity & {
  type: 'text';
  chipTitle?: string;
  placeholder?: string;
};

export type CheckboxFilterSpec = FilterIdentity & {
  type: 'checkbox';
  placeholder?: string;
  options: CheckboxOption[];
};

export type CustomFilterSpec<TValue = unknown> = FilterIdentity & {
  type: 'custom';
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
  | CustomFilterSpec<string[]>
  | CustomFilterSpec<LastSeenKey | ''>;

/**
 * Runtime toolbar filter. `TValue` is erased so mixed-filter arrays type-check;
 * `TQuery` stays so every filter in a view writes the same query type.
 */
export type BoundFilter<TQuery = unknown> = Resolve<
  FilterSpec & {
    updateQuery: (query: TQuery, value: unknown) => TQuery;
  }
>;

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;
