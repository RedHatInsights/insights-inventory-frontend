import React from 'react';
import { System } from '../../hooks/useSystemsQuery';
import type { Column } from '../allColumnDefinitions';

import Recommendations from './cells/Recommendations';

const recommendationsColumn = {
  title: 'Recommendations',
  key: 'recommendations',
  isShownByDefault: false,
  isShown: true,
  renderCell: (system: System) => (
    <Recommendations key={`recommendations-${system.id}`} system={system} />
  ),
};

export default [recommendationsColumn] as const satisfies readonly Column[];
