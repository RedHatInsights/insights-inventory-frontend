import type { ReactNode } from 'react';
import type { ToolbarLabel } from '@patternfly/react-core';
import {
  ApiHostGetHostListRegisteredWithEnum,
  ApiHostGetHostListStalenessEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { LastSeenKey } from '../constants';
import type { LastSeenCustomRange } from '../types';
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
  /** When set, SystemsView debounces this key in the fetch */
  debounceMs?: number;
  /**
   * Maps the URL/UI bag plus extra context to the value the later
   * `updateQuery` fold should see. Defaults to `filters[filterId]`.
   */
  selectValue?: (
    filters: InventoryFilters,
    ctx: FilterSelectContext,
  ) => unknown;
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

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;
