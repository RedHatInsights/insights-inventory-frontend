import {
  Button,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Tooltip,
} from '@patternfly/react-core';
import React from 'react';
import PropTypes from 'prop-types';
import ChromeLoader from '../../Utilities/ChromeLoader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  GROUPS_ADMINISTRATOR_PERMISSIONS,
  NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
} from '../../constants';

const GroupDetailInfo = ({ chrome }) => {
  const path = `${chrome.isBeta() ? '/preview' : ''}/iam/user-access`;
  const { hasAccess: isGroupsAdministrator } = usePermissionsWithContext(
    GROUPS_ADMINISTRATOR_PERMISSIONS,
    true // should fulfilll all requested permissions
  );

  return (
    <Card>
      <CardHeader>
        <CardActions>
          {isGroupsAdministrator ? (
            <Button component="a" href={path} variant="secondary">
              Manage access
            </Button>
          ) : (
            <Tooltip content={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}>
              <Button isAriaDisabled variant="secondary">
                Manage access
              </Button>
            </Tooltip>
          )}
        </CardActions>
        <CardTitle className="pf-c-title pf-m-lg card-title">
          User access configuration
        </CardTitle>
      </CardHeader>
      <CardBody>
        Manage your inventory group user access configuration under
        <a href={path}> Identity & Access Management {'>'} User Access.</a>
      </CardBody>
    </Card>
  );
};

GroupDetailInfo.propTypes = {
  chrome: PropTypes.object,
};

const GroupDetailInfoWithChrome = () => (
  <ChromeLoader>
    <GroupDetailInfo />
  </ChromeLoader>
);

export { GroupDetailInfo };
export default GroupDetailInfoWithChrome;
