import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

interface NoEntitiesFoundProps {
  entities?: string;
  onClearAll?: () => void;
  showIcon?: boolean;
}

const NoEntitiesFound = ({
  entities = 'systems',
  onClearAll,
  showIcon = true,
}: NoEntitiesFoundProps) => (
  <EmptyState
    headingLevel="h5"
    titleText={<>{`No matching ${entities} found`}</>}
    variant={EmptyStateVariant.full}
    data-ouia-component-id="empty-state"
    data-ouia-component-type="PF6/EmptyState"
    data-ouia-safe={true}
    icon={showIcon ? SearchIcon : undefined}
  >
    <EmptyStateBody>
      To continue, edit your filter settings and try again
    </EmptyStateBody>
    <EmptyStateFooter>
      {onClearAll !== undefined && (
        <EmptyStateActions>
          <Button variant="link" onClick={onClearAll}>
            Clear all filters
          </Button>
        </EmptyStateActions>
      )}
    </EmptyStateFooter>
  </EmptyState>
);

export default NoEntitiesFound;
