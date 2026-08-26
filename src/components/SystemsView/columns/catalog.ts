import type { SystemProfileWorkloads } from '@redhat-cloud-services/host-inventory-client';
import { bindColumn } from './bindColumn';
import type { Column, ColumnBinding, ColumnSpec } from './types';
import {
  createdSpec,
  infrastructureSpec,
  lastSeenSpec,
  nameSpec,
  osSpec,
  statusSpec,
  tagsSpec,
  vendorSpec,
  workloadSpec,
  workspaceSpec,
} from './inventory/columnDefinitions';
import type { DisplayNameValue } from './inventory/cells/DisplayName';
import type { WorkspaceValue } from './inventory/cells/Workspace';
import type { TagsValue } from './inventory/cells/Tags';
import type { OperatingSystemValue } from './inventory/cells/OperatingSystem';
import type { LastSeenValue } from './inventory/cells/LastSeen';
import type { StatusTimestamps } from './inventory/cells/Status';
import type { CreatedValue } from './inventory/cells/Created';

/**
 * Shared column factories. Bind a consumer data with `getValue`.
 * Inventory uses `bindInventoryColumns`; other apps should use this catalog.
 * Use `custom` for a column that is not one of the named factories.
 */
export type ColumnCatalog = {
  name: <TItem>(
    binding: ColumnBinding<TItem, DisplayNameValue>,
  ) => Column<TItem>;
  workspace: <TItem>(
    binding: ColumnBinding<TItem, WorkspaceValue | undefined>,
  ) => Column<TItem>;
  tags: <TItem>(binding: ColumnBinding<TItem, TagsValue>) => Column<TItem>;
  os: <TItem>(
    binding: ColumnBinding<TItem, OperatingSystemValue | undefined>,
  ) => Column<TItem>;
  lastSeen: <TItem>(
    binding: ColumnBinding<TItem, LastSeenValue>,
  ) => Column<TItem>;
  status: <TItem>(
    binding: ColumnBinding<TItem, StatusTimestamps>,
  ) => Column<TItem>;
  infrastructure: <TItem>(
    binding: ColumnBinding<TItem, string | undefined>,
  ) => Column<TItem>;
  vendor: <TItem>(
    binding: ColumnBinding<TItem, string | undefined>,
  ) => Column<TItem>;
  workload: <TItem>(
    binding: ColumnBinding<TItem, SystemProfileWorkloads | undefined>,
  ) => Column<TItem>;
  created: <TItem>(
    binding: ColumnBinding<TItem, CreatedValue>,
  ) => Column<TItem>;
  /**
   * Escape hatch for columns that are not in the shared catalog.
   * Same as `bindColumn`; keeps ad-hoc definitions inside the selector.
   */
  custom: <TItem, TValue>(
    spec: ColumnSpec<TValue>,
    binding: ColumnBinding<TItem, TValue>,
  ) => Column<TItem>;
};

export const columnCatalog: ColumnCatalog = {
  name: (binding) => bindColumn(nameSpec, binding),
  workspace: (binding) => bindColumn(workspaceSpec, binding),
  tags: (binding) => bindColumn(tagsSpec, binding),
  os: (binding) => bindColumn(osSpec, binding),
  lastSeen: (binding) => bindColumn(lastSeenSpec, binding),
  status: (binding) => bindColumn(statusSpec, binding),
  infrastructure: (binding) => bindColumn(infrastructureSpec, binding),
  vendor: (binding) => bindColumn(vendorSpec, binding),
  workload: (binding) => bindColumn(workloadSpec, binding),
  created: (binding) => bindColumn(createdSpec, binding),
  custom: bindColumn,
};
