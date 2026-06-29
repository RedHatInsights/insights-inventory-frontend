import { Column } from '../allColumnDefinitions';
import React from 'react';
import InstallableAdvisories from './cells/InstallableAdvisories';
import Template from './cells/Template';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

const APP_NAME = 'content' as const;

const installableAdvisoriesColumn = {
  appName: APP_NAME,
  title: 'Installable advisories',
  key: 'installable-advisories',
  isShownByDefault: false,
  isShown: false,
  sortBy: 'patch:advisories_rhsa_installable',
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
  key: 'template_name',
  isShownByDefault: false,
  isShown: false,
  renderCell(system: InventoryViewSystem) {
    return <Template appData={system?.app_data?.patch} />;
  },
};

export default [
  installableAdvisoriesColumn,
  templateColumn,
] as const satisfies readonly Column[];
