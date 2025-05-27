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

const InnerButton = ({ onClick }) => (
  <Button
    onClick={onClick}
    className="ins-c-inventory__detail--action"
    aria-label="Edit"
    variant="link"
  >
    <PencilAltIcon />
  </Button>
);

InnerButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const EditButtonUnknownPermissions = (props) => {
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);

  const { hasAccess: canEditHost } = usePermissionsWithContext([
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
      entity?.groups?.[0]?.id ?? null, // null stands for ungroupped hosts
    ),
  ]);

  if (!canEditHost) {
    return (
      <Tooltip content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}>
        <Button
          isAriaDisabled
          isDisabled={true}
          aria-label="Edit"
          variant="plain"
        >
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

  if (isProd?.() || writePermissions) {
    return <InnerButton {...props} />;
  }

  if (typeof writePermissions !== 'boolean') {
    return <EditButtonUnknownPermissions {...props} />;
  }

  return (
    <Tooltip content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}>
      <Button
        isAriaDisabled
        isDisabled={true}
        aria-label="Edit"
        variant="plain"
      >
        <PencilAltIcon />
      </Button>
    </Tooltip>
  );
};

EditButtonWrapper.propTypes = {
  writePermissions: PropTypes.bool,
};

export default EditButtonWrapper;
