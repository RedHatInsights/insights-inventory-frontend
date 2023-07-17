import React from 'react';
import PropTypes from 'prop-types';
import { NotAuthorized } from '@redhat-cloud-services/frontend-components/NotAuthorized';
import { Tooltip } from '@patternfly/react-core';

const AccessDenied = ({ title, description, requiredPermission, ...props }) => (
  <NotAuthorized
    {...props}
    className="ins-c-inventory__no--access"
    title={title}
    description={<Tooltip content={requiredPermission}>{description}</Tooltip>}
  />
);

AccessDenied.propTypes = {
  title: PropTypes.string,
  description: PropTypes.node,
  requiredPermission: PropTypes.string,
};

AccessDenied.defaultProps = {
  title: 'You do not have access to Inventory',
  description: (
    <div>
      To view your systems, you must be granted inventory access from your
      Organization Administrator.
    </div>
  ),
  requiredPermission: 'inventory:*:read',
};

export default AccessDenied;
