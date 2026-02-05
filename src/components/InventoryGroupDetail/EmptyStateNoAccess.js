import React from 'react';
import PropTypes from 'prop-types';
import AccessDenied from '../../Utilities/AccessDenied';

export const EmptyStateNoAccessToSystems = () => (
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

export const EmptyStateNoAccessToGroups = ({ isSingle }) => (
  <AccessDenied
    title="Workspace access permissions needed"
    showReturnButton={false}
    description={
      <div>
        You do not have the necessary workspace permissions to see
        {isSingle ? ' this workspace' : ' workspaces'}. Contact your
        organization administrator for access.
      </div>
    }
    variant="large" // overrides the default "full" value
    requiredPermission="inventory:groups:read"
  />
);

EmptyStateNoAccessToGroups.propTypes = {
  isSingle: PropTypes.bool,
};
