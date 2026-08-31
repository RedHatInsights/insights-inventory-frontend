import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import type { Column, ColumnSpec } from '../types';
import { bindColumn } from '../bindColumn';
import type { InventoryBindableItem } from '../inventory/columnDefinitions';
import type { AdvisorAppData } from '@redhat-cloud-services/host-inventory-client';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import AdvisorCount from './cells/AdvisorCount';
import AdvisorRecommendations from './cells/AdvisorRecommendations';

const APP_NAME = 'advisor' as const;

const bindAdvisorCountColumn = <TItem extends InventoryBindableItem>(
  spec: ColumnSpec<AdvisorAppData | undefined>,
): Column<TItem> =>
  bindColumn(spec, {
    getValue: (item) => item.app_data?.advisor as AdvisorAppData | undefined,
  });

// Value type for AdvisorRecommendations component
type AdvisorRecommendationsValue = {
  appData: AdvisorAppData | undefined;
  systemId: string;
};

const recommendationsSpec: ColumnSpec<AdvisorRecommendationsValue> = {
  appName: APP_NAME,
  title: 'Recommendations',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorcritical,
  minWidth: '12rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorcritical,
  renderCell: (value) => (
    <AdvisorRecommendations appData={value.appData} systemId={value.systemId} />
  ),
};

const incidentsSpec: ColumnSpec<AdvisorAppData | undefined> = {
  appName: APP_NAME,
  title: (
    <span>
      Incidents
      <Tooltip content="Indicates configurations that are currently affecting your system.">
        <Icon status="custom" className="pf-v6-u-ml-xs">
          <OutlinedQuestionCircleIcon color="var(--pf-t--global--icon--color--subtle)" />
        </Icon>
      </Tooltip>
    </span>
  ),
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  minWidth: '10rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (value) => (
    <AdvisorCount appData={value} countField="incidents" />
  ),
};

export const bindAdvisorColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  bindColumn(recommendationsSpec, {
    getValue: (item) => ({
      appData: item.app_data?.advisor as AdvisorAppData | undefined,
      systemId: item.id,
    }),
  }),
  bindAdvisorCountColumn<TItem>(incidentsSpec),
];

export default bindAdvisorColumns();
