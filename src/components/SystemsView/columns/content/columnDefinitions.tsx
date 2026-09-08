import React from 'react';
import type { Column, ColumnSpec } from '../types';
import { bindColumn } from '../bindColumn';
import type { InventoryBindableItem } from '../inventory/columnDefinitions';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';
import InstallableAdvisories from './cells/InstallableAdvisories';
import Template from './cells/Template';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const APP_NAME = 'content' as const;

type InstallableAdvisoriesValue = {
  appData: PatchAppData | undefined;
  systemId: string;
};

const installableAdvisoriesSpec: ColumnSpec<InstallableAdvisoriesValue> = {
  appName: APP_NAME,
  title: 'Installable advisories',
  key: ApiHostViewsGetHostViewsOrderByEnum.PatchadvisoriesRhsaInstallable,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.PatchadvisoriesRhsaInstallable,
  renderCell: (value) => (
    <InstallableAdvisories appData={value.appData} systemId={value.systemId} />
  ),
};

const templateSpec: ColumnSpec<PatchAppData | undefined> = {
  appName: APP_NAME,
  title: 'Template',
  key: ApiHostViewsGetHostViewsOrderByEnum.PatchtemplateName,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.PatchtemplateName,
  minWidth: '9rem',
  renderCell: (value) => <Template appData={value} />,
};

export const bindContentColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  bindColumn(installableAdvisoriesSpec, {
    getValue: (item) => ({
      appData: item.app_data?.patch as PatchAppData | undefined,
      systemId: item.id || '',
    }),
  }),
  bindColumn(templateSpec, {
    getValue: (item) => item.app_data?.patch as PatchAppData | undefined,
  }),
];
