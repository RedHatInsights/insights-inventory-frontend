import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Button, Tooltip } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { useConditionalRBAC } from '../../../Utilities/hooks/useConditionalRBAC';
import { useKesselMigrationFeatureFlag } from '../../../Utilities/hooks/useKesselMigrationFeatureFlag';
import {
  NO_MODIFY_HOST_KESSEL_TOOLTIP_MESSAGE,
  NO_MODIFY_HOST_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';

const EditButton = ({
  writePermissions,
  variant = 'plain',
  onClick,
  className,
  noAccessTooltip,
  ...rest
}) => {
  const { isProd } = useChrome();
  const isKesselEnabled = useKesselMigrationFeatureFlag();
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

  const permissionDeniedTooltip =
    noAccessTooltip ??
    (isKesselEnabled && writePermissions === false
      ? NO_MODIFY_HOST_KESSEL_TOOLTIP_MESSAGE
      : NO_MODIFY_HOST_TOOLTIP_MESSAGE);

  const button = (
    <Button
      {...rest}
      icon={<PencilAltIcon />}
      type="button"
      className={classnames('ins-c-inventory__detail--action', className)}
      aria-label="Edit"
      variant={variant}
      onClick={isEnabled ? onClick : undefined}
      isAriaDisabled={!isEnabled}
    />
  );

  if (!isEnabled) {
    return <Tooltip content={permissionDeniedTooltip}>{button}</Tooltip>;
  }

  return button;
};

EditButton.propTypes = {
  writePermissions: PropTypes.bool,
  noAccessTooltip: PropTypes.string,
  /** 'plain' for field-specific inline edit (default), 'link' for full-page edit */
  variant: PropTypes.oneOf(['plain', 'link']),
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default EditButton;
