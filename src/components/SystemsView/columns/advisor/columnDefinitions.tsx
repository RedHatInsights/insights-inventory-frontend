import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewHost } from '../../hooks/useInventoryViewsQuery';

import Recommendations from './cells/Recommendations';

const recommendationsColumn = {
  title: 'Recommendations',
  key: 'recommendations',
  isShownByDefault: false,
  isShown: true,
  renderCell: (system: InventoryViewHost) => (
    <Recommendations key={`recommendations-${system.id}`} system={system} />
  ),
};

export default [recommendationsColumn] as const satisfies readonly Column[];
