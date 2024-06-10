import React from 'react';
import AccessDenied from '../../Utilities/AccessDenied';
import useWorkspaceFeatureFlag from '../../Utilities/hooks/useWorkspaceFeatureFlag';

const EmptyStateNoAccessToSystems = () => {
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <AccessDenied
      title={`Access needed for systems in this ${
        isWorkspaceEnabled ? 'workspace' : 'group'
      }`}
      showReturnButton={false}
      description={
        <div>
          {`You do not have the necessary inventory host permissions to see the
        systems in this ${
          isWorkspaceEnabled ? 'workspace' : 'group'
        }. Contact your organization administrator for
        access.`}
        </div>
      }
      variant="large" // overrides the default "full" value
      requiredPermission="inventory:hosts:read"
    />
  );
};

const EmptyStateNoAccessToGroup = () => {
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <AccessDenied
      title={`${
        isWorkspaceEnabled ? 'Workspace' : 'Inventory group'
      } access permissions needed`}
      showReturnButton={false}
      description={
        <div>
          {`You do not have the necessary ${
            isWorkspaceEnabled ? 'workspace' : 'inventory group'
          } permissions to see this
        ${
          isWorkspaceEnabled ? 'workspace' : 'inventory group'
        }. Contact your organization administrator for access.`}
        </div>
      }
      variant="large" // overrides the default "full" value
      requiredPermission="inventory:groups:read"
    />
  );
};

const EmptyStateNoAccessToGroups = () => {
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <AccessDenied
      title={`${
        isWorkspaceEnabled ? 'Workspace' : 'Inventory group'
      } access permissions needed`}
      showReturnButton={false}
      description={
        <div>
          {`You do not have the necessary ${
            isWorkspaceEnabled ? 'workspace' : 'inventory group'
          } permissions to see
        ${
          isWorkspaceEnabled ? 'workspaces' : 'inventory groups'
        }. Contact your organization administrator for access.`}
        </div>
      }
      variant="large" // overrides the default "full" value
      requiredPermission="inventory:groups:read"
    />
  );
};

export {
  EmptyStateNoAccessToGroup,
  EmptyStateNoAccessToSystems,
  EmptyStateNoAccessToGroups,
};
