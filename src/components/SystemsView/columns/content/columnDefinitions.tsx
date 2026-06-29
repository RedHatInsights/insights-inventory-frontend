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
    const key = `${this.key}-${system.id}`;
    const value = system?.app_data?.patch;

    return value ? (
      <InstallableAdvisories
        key={key}
        value={value}
        systemUUID={system.id ?? ''}
      />
    ) : (
      'N/A'
    );
  },
} satisfies Column;

const templateColumn = {
  appName: APP_NAME,
  title: 'Template',
  key: 'template_name',
  isShownByDefault: false,
  isShown: false,
  renderCell(system: InventoryViewSystem) {
    const key = `${this.key}-${system.id}`;
    const value = system?.app_data?.patch;

    return value ? <Template key={key} value={value} /> : 'N/A';
  },
} satisfies Column;

export default [
  installableAdvisoriesColumn,
  templateColumn,
] as const satisfies readonly Column[];
