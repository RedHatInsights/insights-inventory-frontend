import type { Column } from '../allColumnDefinitions';
import { InventoryViewHost } from '../../hooks/useInventoryViewsQuery';

const remediationPlansColumn = {
  title: 'Remediation plans',
  key: 'remediations_plans',
  isShownByDefault: false,
  isShown: false,
  sortBy: 'remediations:remediations_plans',
  renderCell: (system: InventoryViewHost) => {
    return system?.app_data?.remediations?.remediations_plans ?? 'N/A';
  },
};

export default [remediationPlansColumn] as const satisfies readonly Column[];
