import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { useConditionalRBAC } from '../../../Utilities/hooks/useConditionalRBAC';
import {
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';

const EditButton = ({
  writePermissions,
  variant = 'plain',
  onClick,
  className,
  ...rest
}) => {
  const { isProd } = useChrome();
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);

  const { hasAccess: canEditFromRbac } = useConditionalRBAC([
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
      entity?.groups?.[0]?.id ?? null,
    ),
  ]);

  const isEnabled =
    Boolean(isProd?.()) ||
    writePermissions === true ||
    (typeof writePermissions !== 'boolean' && canEditFromRbac);

  const button = (
    <Button
      {...rest}
      icon={<PencilAltIcon />}
      type="button"
      className={classnames('ins-c-inventory__detail--action', className)}
      aria-label="Edit"
      variant={variant}
      onClick={isEnabled ? onClick : undefined}
      isDisabled={!isEnabled}
      isAriaDisabled={!isEnabled}
    />
  );

  if (!isEnabled) {
    return <Tooltip content={NO_MODIFY_HOST_TOOLTIP_MESSAGE}>{button}</Tooltip>;
  }

  return button;
};

EditButton.propTypes = {
  writePermissions: PropTypes.bool,
  /** 'plain' for field-specific inline edit (default), 'link' for full-page edit */
  variant: PropTypes.oneOf(['plain', 'link']),
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default EditButton;
