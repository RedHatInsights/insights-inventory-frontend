import { Column } from '../allColumnDefinitions';
import React from 'react';
import InstallableAdvisories from './cells/InstallableAdvisories';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

const installableAdvisoriesColumn = {
  appName: 'patch',
  title: 'Installable Advisories',
  key: 'installable-advisories',
  isShownByDefault: true,
  isShown: true,
  sortBy: 'patch:advisories_rhsa_installable',
  renderCell(system: InventoryViewSystem) {
    const key = `${this.key}-${system.id}`;
    const value = system?.app_data?.patch;

    return value ? <InstallableAdvisories key={key} value={value} /> : 'N/A';
  },
};

export default [
  installableAdvisoriesColumn,
] as const satisfies readonly Column[];
