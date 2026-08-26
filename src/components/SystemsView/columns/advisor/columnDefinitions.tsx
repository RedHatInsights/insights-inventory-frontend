import React from 'react';
import type { Column, ColumnSpec } from '../types';
import { bindColumn } from '../bindColumn';
import type { InventoryBindableItem } from '../inventory/columnDefinitions';
import type { AdvisorAppData } from '@redhat-cloud-services/host-inventory-client';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import AdvisorCount from './cells/AdvisorCount';

const APP_NAME = 'advisor' as const;

const bindAdvisorCountColumn = <TItem extends InventoryBindableItem>(
  spec: ColumnSpec<AdvisorAppData | undefined>,
): Column<TItem> =>
  bindColumn(spec, {
    getValue: (item) => item.app_data?.advisor as AdvisorAppData | undefined,
  });

const recommendationsSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: 'Recommendations',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  minWidth: '10rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  renderCell: (value) => (
    <AdvisorCount appData={value} countField="recommendations" />
  ),
};

const incidentsSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: 'Incidents',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  minWidth: '7rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (value) => (
    <AdvisorCount appData={value} countField="incidents" />
  ),
};

const criticalSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: 'Critical',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorcritical,
  minWidth: '7rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorcritical,
  renderCell: (value) => <AdvisorCount appData={value} countField="critical" />,
};

const importantSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: 'Important',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorimportant,
  minWidth: '7rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorimportant,
  renderCell: (value) => (
    <AdvisorCount appData={value} countField="important" />
  ),
};

const moderateSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: 'Moderate',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisormoderate,
  minWidth: '7rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisormoderate,
  renderCell: (value) => <AdvisorCount appData={value} countField="moderate" />,
};

const lowSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: 'Low',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorlow,
  minWidth: '6rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorlow,
  renderCell: (value) => <AdvisorCount appData={value} countField="low" />,
};

export const bindAdvisorColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  bindAdvisorCountColumn<TItem>(recommendationsSpec),
  bindAdvisorCountColumn<TItem>(incidentsSpec),
  bindAdvisorCountColumn<TItem>(criticalSpec),
  bindAdvisorCountColumn<TItem>(importantSpec),
  bindAdvisorCountColumn<TItem>(moderateSpec),
  bindAdvisorCountColumn<TItem>(lowSpec),
];
