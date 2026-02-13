import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, LockIcon } from '@patternfly/react-icons';

const HostStalenessNoAccess = () => {
  return (
    <EmptyState
      headingLevel="h5"
      icon={LockIcon}
      titleText="Access permissions needed"
    >
      <EmptyStateBody className="pf-v6-u-mb-xl">
        You do not have the necessary Staleness and Deletion viewer role
        required to view this page.
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant="link"
          component="a"
          // href= "There is currently no document created for this - UX"
        >
          <p>
            Learn more about managing user access{' '}
            <ExternalLinkAltIcon className="pf-v6-u-ml-sm " />
          </p>
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default HostStalenessNoAccess;
