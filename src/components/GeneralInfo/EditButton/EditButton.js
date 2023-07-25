import React from 'react';
import PropTypes from 'prop-types';

import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { PencilAltIcon } from '@patternfly/react-icons';
import {
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@patternfly/react-core';

const InnerButton = ({ link, onClick }) => (
  <Button
    component="a"
    href={`${window.location.href}/${link}`}
    onClick={onClick}
    className="ins-c-inventory__detail--action"
    aria-label="Edit"
    variant="plain"
  >
    <PencilAltIcon />
  </Button>
);

InnerButton.propTypes = {
  link: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

let permissionsCache = undefined;

const EditButtonUnknownPermissions = (props) => {
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);

  const { hasAccess: canEditHost } = usePermissionsWithContext([
    'inventory:hosts:write',
    ...(entity?.groups?.[0]?.id !== undefined // if the host is in a group, then we can check group level access
      ? [REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(entity?.groups?.[0]?.id)]
      : []),
  ]);
  if (canEditHost) {
    permissionsCache = canEditHost;
  }

  if (!canEditHost) {
    return (
      <Tooltip
        aria="none"
        aria-live="polite"
        content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}
      >
        <Button isAriaDisabled aria-label="Edit" variant="plain">
          <PencilAltIcon />
        </Button>
      </Tooltip>
    );
  }

  return <InnerButton {...props} />;
};

EditButtonUnknownPermissions.propTypes = {
  link: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const EditButtonWrapper = ({ writePermissions, ...props }) => {
  const { isProd } = useChrome();

  if (isProd?.() || writePermissions || permissionsCache) {
    return <InnerButton {...props} />;
  }

  if (typeof writePermissions !== 'boolean') {
    return <EditButtonUnknownPermissions {...props} />;
  }

  return (
    <Tooltip content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}>
      <PencilAltIcon />
    </Tooltip>
  );
};

EditButtonWrapper.propTypes = {
  writePermissions: PropTypes.bool,
};

export default EditButtonWrapper;
