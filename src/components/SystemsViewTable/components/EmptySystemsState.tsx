import React from 'react';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

export const EmptySystemsState: React.FC = () => {
  return (
    <EmptyState headingLevel="h4" icon={CubesIcon} titleText="No data found">
      <EmptyStateBody>
        There are no matching data to be displayed.
      </EmptyStateBody>
    </EmptyState>
  );
};
