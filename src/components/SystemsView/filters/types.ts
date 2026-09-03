import type { ReactNode } from 'react';
import type { ToolbarLabel } from '@patternfly/react-core';
import {
  ApiHostGetHostListRegisteredWithEnum,
  ApiHostGetHostListStalenessEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { LastSeenKey } from '../constants';
import type { DataViewCustomFilterProps } from './DataViewCustomFilter';

type CheckboxOption = { label: ReactNode; value: string };

type FilterIdentity = {
  filterId: string;
  title: string;
};

export type TextFilterSpec = FilterIdentity & {
  type: 'text';
  chipTitle?: string;
  placeholder?: string;
  debounceMs?: number;
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

/**
 * Identity + DataViewFilter control fields.
 * Parent `DataViewFilters` injects `value` / `onChange` / `showToolbarItem` onto Filter children.
 */
export type FilterSpec =
  | TextFilterSpec
  | CheckboxFilterSpec
  | CustomFilterSpec<string[]>
  | CustomFilterSpec<LastSeenKey | ''>;

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

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;
