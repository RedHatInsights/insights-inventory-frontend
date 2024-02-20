import React from 'react';
import AccessDenied from '../../Utilities/AccessDenied';

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
    variant="large" // overrides the default "full" value
    requiredPermission="inventory:hosts:read"
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
    variant="large" // overrides the default "full" value
    requiredPermission="inventory:groups:read"
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
    variant="large" // overrides the default "full" value
    requiredPermission="inventory:groups:read"
  />
);

export {
  EmptyStateNoAccessToGroup,
  EmptyStateNoAccessToSystems,
  EmptyStateNoAccessToGroups,
};
