import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

const APP_NAME = 'remediations' as const;

const remediationPlansColumn = {
  appName: APP_NAME,
  title: 'Remediation plans',
  key: 'remediations_plans',
  minWidth: '12rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: 'remediations:remediations_plans',
  renderCell: (system: InventoryViewSystem) => {
    return system?.app_data?.remediations?.remediations_plans ?? 'N/A';
  },
};

export default [remediationPlansColumn] as const satisfies readonly Column[];
