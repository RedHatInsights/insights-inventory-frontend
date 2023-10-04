import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, LockIcon } from '@patternfly/react-icons';

const HostStalenessNoAccess = () => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={LockIcon} />
      <Title headingLevel="h5" size="lg">
        Access permissions needed
      </Title>
      <EmptyStateBody className="pf-u-mb-xl">
        You do not have the necessary Inventory staleness and deletion viewer
        role required to view this page.
      </EmptyStateBody>
      <Button
        variant="link"
        component="a"
        // href= "There is currently no document created for this - UX"
      >
        <p>
          Learn more about managing user access{' '}
          <ExternalLinkAltIcon className="pf-u-ml-sm " />
        </p>
      </Button>
    </EmptyState>
  );
};

export default HostStalenessNoAccess;
