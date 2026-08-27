import type { ReactNode } from 'react';
import type { ColumnManagementModalColumn } from '@patternfly/react-component-groups';
import type { Resolve } from '../../../types/utility-types';

export type ConsumerAppName =
  | 'advisor'
  | 'compliance'
  | 'inventory'
  | 'malware'
  | 'content'
  | 'remediations'
  | 'vulnerability';

/**
 * Shared column identity independent of any backend.
 */
export type ColumnSpec<TValue> = {
  key: string;
  title: ReactNode;
  renderCell: (value: TValue) => ReactNode;
  isUntoggleable?: boolean;
  minWidth?: string;
  appName: ConsumerAppName;
  /** Default backend sort param; a binding may override. */
  sortBy?: string;
};

/**
 * Consumer adapter passed to `bindColumn`, named catalog factories, and `catalog.custom`
 * while `TValue` is still known.
 */
export type ColumnBinding<TItem, TValue> = {
  getValue: (item: TItem) => TValue;
  sortBy?: string;
  isShownByDefault?: boolean;
};

/**
 * Runtime table column. `TValue` is erased so mixed-column arrays type-check;
 * `TItem` stays so every column in a view reads the same row type.
 */
export type Column<TItem = unknown> = Resolve<
  ColumnManagementModalColumn & {
    getValue: (item: TItem) => unknown;
    renderCell: (value: unknown) => ReactNode;
    sortBy?: string;
    minWidth?: string;
    appName: ConsumerAppName;
    isPermissionLocked?: boolean;
  }
>;
