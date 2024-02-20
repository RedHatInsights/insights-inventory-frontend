import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, LockIcon } from '@patternfly/react-icons';

const HostStalenessNoAccess = () => {
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="Access permissions needed"
        icon={<EmptyStateIcon icon={LockIcon} />}
        headingLevel="h5"
      />
      <EmptyStateBody className="pf-v5-u-mb-xl">
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
            <ExternalLinkAltIcon className="pf-v5-u-ml-sm " />
          </p>
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default HostStalenessNoAccess;
