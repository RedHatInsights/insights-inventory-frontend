import React from 'react';
import AccessDenied from '../../Utilities/AccessDenied';
import { EmptyStateVariant } from '@patternfly/react-core';

const EmptyStateNoAccessToSystems = () => (
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

const EmptyStateNoAccessToGroup = () => (
  <AccessDenied
    title="Inventory group access permissions needed"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary inventory group permissions to see this
        inventory group. Contact your organization administrator for access.
      </div>
    }
    variant={EmptyStateVariant.large} // overrides the default "full" value
  />
);

const EmptyStateNoAccessToGroups = () => (
  <AccessDenied
    title="Inventory group access permissions needed"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary inventory group permissions to see
        inventory groups. Contact your organization administrator for access.
      </div>
    }
    variant={EmptyStateVariant.large} // overrides the default "full" value
  />
);

export {
  EmptyStateNoAccessToGroup,
  EmptyStateNoAccessToSystems,
  EmptyStateNoAccessToGroups,
};
