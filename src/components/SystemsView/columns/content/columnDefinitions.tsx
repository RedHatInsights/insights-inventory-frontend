import { Column } from '../allColumnDefinitions';
import React from 'react';
import InstallableAdvisories from './cells/InstallableAdvisories';
import Template from './cells/Template';
import { InventoryViewSystem } from '../../../InventoryViews/hooks/useInventoryViewsQuery';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const APP_NAME = 'content' as const;

const installableAdvisoriesColumn = {
  appName: APP_NAME,
  title: 'Installable advisories',
  key: ApiHostViewsGetHostViewsOrderByEnum.PatchadvisoriesRhsaInstallable,
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.PatchadvisoriesRhsaInstallable,
  renderCell(system: InventoryViewSystem) {
    return (
      <InstallableAdvisories
        appData={system?.app_data?.patch}
        systemId={system.id || ''}
      />
    );
  },
};

const templateColumn = {
  appName: APP_NAME,
  title: 'Template',
  key: ApiHostViewsGetHostViewsOrderByEnum.PatchtemplateName,
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.PatchtemplateName,
  renderCell(system: InventoryViewSystem) {
    return <Template appData={system?.app_data?.patch} />;
  },
};

export default [
  installableAdvisoriesColumn,
  templateColumn,
] as const satisfies readonly Column[];
