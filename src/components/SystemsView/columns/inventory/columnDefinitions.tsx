import React from 'react';
import { ApiHostViewsGetHostViewsOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import type {
  HostViewHost,
  StructuredTag,
  SystemProfileWorkloads,
} from '@redhat-cloud-services/host-inventory-client';
import type { SystemsViewItem } from '../../types';
import type { Column, ColumnSpec } from '../types';
import { bindColumn } from '../bindColumn';
import { DEFAULT_NAME_COLUMN_MIN_WIDTH } from '../../utils/columnMinWidths';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import DisplayName, { type DisplayNameValue } from './cells/DisplayName';
import Workspace, { type WorkspaceValue } from './cells/Workspace';
import LastSeen, { type LastSeenValue } from './cells/LastSeen';
import OperatingSystem, {
  type OperatingSystemValue,
} from './cells/OperatingSystem';
import Status, { type StatusTimestamps } from './cells/Status';
import Tags, { type TagsValue } from './cells/Tags';
import Workload from './cells/Workload';
import Vendor from './cells/Vendor';
import Infrastructure from './cells/Infrastructure';
import Created, { type CreatedValue } from './cells/Created';

/**
 * Fields inventory column bindings for both InventoryHosts and InventoryViews can use
 * `id` is required for the table;
 * `tags` is merged client-side from `getHostTags`.
 */
export type InventoryBindableItem = SystemsViewItem &
  Pick<
    HostViewHost,
    | 'display_name'
    | 'groups'
    | 'last_check_in'
    | 'culled_timestamp'
    | 'stale_timestamp'
    | 'stale_warning_timestamp'
    | 'per_reporter_staleness'
    | 'created'
    | 'system_profile'
    | 'app_data'
  > & {
    tags?: StructuredTag[];
  };

const APP_NAME = 'inventory' as const;

export const nameSpec: ColumnSpec<DisplayNameValue> = {
  appName: APP_NAME,
  title: 'Name',
  key: ApiOrderByEnum.DisplayName,
  minWidth: DEFAULT_NAME_COLUMN_MIN_WIDTH,
  isUntoggleable: true,
  sortBy: ApiOrderByEnum.DisplayName,
  renderCell: (value) => <DisplayName value={value} />,
};

export const workspaceSpec: ColumnSpec<WorkspaceValue | undefined> = {
  appName: APP_NAME,
  title: 'Workspace',
  key: ApiOrderByEnum.GroupName,
  minWidth: '10rem',
  sortBy: ApiOrderByEnum.GroupName,
  renderCell: (value) => <Workspace value={value} />,
};

export const tagsSpec: ColumnSpec<TagsValue> = {
  appName: APP_NAME,
  title: 'Tags',
  key: 'tags',
  minWidth: '6rem',
  renderCell: (value) => <Tags value={value} />,
};

export const osSpec: ColumnSpec<OperatingSystemValue | undefined> = {
  appName: APP_NAME,
  title: 'OS',
  key: ApiOrderByEnum.OperatingSystem,
  minWidth: '11rem',
  sortBy: ApiOrderByEnum.OperatingSystem,
  renderCell: (value) => <OperatingSystem value={value} />,
};

export const lastSeenSpec: ColumnSpec<LastSeenValue> = {
  appName: APP_NAME,
  title: <LastSeenColumnHeader />,
  key: ApiOrderByEnum.LastCheckIn,
  minWidth: '9rem',
  sortBy: ApiOrderByEnum.LastCheckIn,
  renderCell: (value) => <LastSeen value={value} />,
};

export const statusSpec: ColumnSpec<StatusTimestamps> = {
  appName: APP_NAME,
  title: 'Status',
  key: 'status',
  minWidth: '9rem',
  sortBy: 'status',
  renderCell: (value) => <Status value={value} />,
};

export const infrastructureSpec: ColumnSpec<string | undefined> = {
  appName: APP_NAME,
  title: 'Infrastructure',
  key: 'infrastructure',
  renderCell: (value) => <Infrastructure value={value} />,
};

export const vendorSpec: ColumnSpec<string | undefined> = {
  appName: APP_NAME,
  title: 'Vendor',
  key: 'vendor',
  renderCell: (value) => <Vendor value={value} />,
};

export const workloadSpec: ColumnSpec<SystemProfileWorkloads | undefined> = {
  appName: APP_NAME,
  title: 'Workload',
  key: 'workload',
  renderCell: (value) => <Workload value={value} />,
};

export const createdSpec: ColumnSpec<CreatedValue> = {
  appName: APP_NAME,
  title: 'Created',
  key: 'created',
  renderCell: (value) => <Created value={value} />,
};

const isImageBasedSystem = (item: InventoryBindableItem) =>
  Boolean(
    item.system_profile?.bootc_status?.booted?.image_digest ||
      item.system_profile?.host_type === 'edge',
  );

const isCentosLinuxSystem = (item: InventoryBindableItem) =>
  item.system_profile?.operating_system?.name === 'CentOS Linux';

/**
 * Inventory-only bindings of catalog specs onto `InventoryBindableItem`.
 *  @returns Bound inventory columns for an Inventory consumers.
 */
export const bindInventoryColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  bindColumn(nameSpec, {
    getValue: (item) => ({
      id: item.id,
      displayName: item.display_name,
      isImageBased: isImageBasedSystem(item),
      isCentosLinux: isCentosLinuxSystem(item),
    }),
  }),
  bindColumn(workspaceSpec, {
    getValue: (item) => item.groups,
  }),
  bindColumn(tagsSpec, {
    getValue: (item) => ({
      id: item.id,
      display_name: item.display_name,
      tags: item.tags,
    }),
  }),
  bindColumn(osSpec, {
    getValue: (item) => item.system_profile?.operating_system,
  }),
  bindColumn(lastSeenSpec, {
    getValue: (item) => ({
      lastSeen: item.last_check_in,
      culled: item.culled_timestamp ?? undefined,
      staleWarning: item.stale_warning_timestamp ?? undefined,
      stale: item.stale_timestamp ?? undefined,
      perReporterStaleness: item.per_reporter_staleness,
    }),
  }),
  bindColumn(statusSpec, {
    getValue: (item) => ({
      stale: item.stale_timestamp,
      staleWarning: item.stale_warning_timestamp,
      culled: item.culled_timestamp,
    }),
  }),
  bindColumn(infrastructureSpec, {
    getValue: (item) => item.system_profile?.infrastructure_type,
  }),
  bindColumn(vendorSpec, {
    getValue: (item) => item.system_profile?.infrastructure_vendor,
  }),
  bindColumn(workloadSpec, {
    getValue: (item) => item.system_profile?.workloads,
  }),
  bindColumn(createdSpec, {
    getValue: (item) => item.created,
  }),
];

export default bindInventoryColumns();
