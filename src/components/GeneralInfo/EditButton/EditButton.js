import React from 'react';
import PropTypes from 'prop-types';

import { useConditionalRBAC } from '../../../Utilities/hooks/useConditionalRBAC';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { PencilAltIcon } from '@patternfly/react-icons';
import {
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@patternfly/react-core';

const InnerButton = ({ onClick, variant = 'plain' }) => (
  <Button
    icon={<PencilAltIcon />}
    onClick={onClick}
    className="ins-c-inventory__detail--action"
    aria-label="Edit"
    variant={variant}
  ></Button>
);

InnerButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  /** 'plain' for field-specific inline edit (pencil toggle), 'link' for full-page edit */
  variant: PropTypes.oneOf(['plain', 'link']),
};

const EditButtonUnknownPermissions = (props) => {
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);

  const { hasAccess: canEditHost } = useConditionalRBAC([
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
      entity?.groups?.[0]?.id ?? null, // null stands for ungroupped hosts
    ),
  ]);

  if (!canEditHost) {
    return (
      <Tooltip content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}>
        <Button
          icon={<PencilAltIcon />}
          isAriaDisabled
          isDisabled={true}
          aria-label="Edit"
          variant="plain"
        />
      </Tooltip>
    );
  }

  return <InnerButton {...props} />;
};

EditButtonUnknownPermissions.propTypes = {
  link: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['plain', 'link']),
};

const EditButtonWrapper = ({ writePermissions, variant, ...props }) => {
  const { isProd } = useChrome();

  if (isProd?.() || writePermissions) {
    return <InnerButton variant={variant} {...props} />;
  }

  if (typeof writePermissions !== 'boolean') {
    return <EditButtonUnknownPermissions variant={variant} {...props} />;
  }

  return (
    <Tooltip content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}>
      <Button
        icon={<PencilAltIcon />}
        isAriaDisabled
        isDisabled={true}
        aria-label="Edit"
        variant="plain"
      />
    </Tooltip>
  );
};

EditButtonWrapper.propTypes = {
  writePermissions: PropTypes.bool,
  /** 'plain' for field-specific inline edit (default), 'link' for full-page edit */
  variant: PropTypes.oneOf(['plain', 'link']),
};

export default EditButtonWrapper;
