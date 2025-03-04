import React from 'react';
import AccessDenied from '../../Utilities/AccessDenied';

const EmptyStateNoAccessToSystems = () => (
  <AccessDenied
    title="Access needed for systems in this workspace"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary inventory host permissions to see the
        systems in this workspace. Contact your organization administrator for
        access.
      </div>
    }
    variant="large" // overrides the default "full" value
    requiredPermission="inventory:hosts:read"
  />
);

const EmptyStateNoAccessToGroup = () => (
  <AccessDenied
    title="Workspace access permissions needed"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary workspace permissions to see this
        workspace. Contact your organization administrator for access.
      </div>
    }
    variant="large" // overrides the default "full" value
    requiredPermission="inventory:groups:read"
  />
);

const EmptyStateNoAccessToGroups = () => (
  <AccessDenied
    title="Workspace access permissions needed"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary workspace permissions to see workspaces.
        Contact your organization administrator for access.
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
