import React from 'react';
import PropTypes from 'prop-types';
import { UnauthorizedAccess } from '@patternfly/react-component-groups';
import { Tooltip } from '@patternfly/react-core';

const AccessDenied = ({ description, requiredPermission, title, ...props }) => {
  return (
    <UnauthorizedAccess
      serviceName="inventory"
      titleText={title}
      {...props}
      className="ins-c-inventory__no--access"
      bodyText={<Tooltip content={requiredPermission}>{description}</Tooltip>}
    />
  );
};

AccessDenied.propTypes = {
  description: PropTypes.node,
  requiredPermission: PropTypes.string,
  title: PropTypes.string,
};

AccessDenied.defaultProps = {
  description: (
    <div>
      To view your systems, you must be granted inventory access from your
      Organization Administrator.
    </div>
  ),
  requiredPermission: 'inventory:*:read',
};

export default AccessDenied;
