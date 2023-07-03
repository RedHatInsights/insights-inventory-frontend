import React from 'react';
import AccessDenied from '../../Utilities/AccessDenied';
import { EmptyStateVariant } from '@patternfly/react-core';

const EmptyStateNoAccess = () => (
  <AccessDenied
    title="Access needed for systems in this group"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary inventory host permissions to see the
        systems in this group. Contact your organization administrator for
        access.
      </div>
    }
    variant={EmptyStateVariant.large} // overrides the default "full" value
  />
);

export default EmptyStateNoAccess;
