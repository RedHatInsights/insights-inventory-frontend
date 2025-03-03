import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';
import PropTypes from 'prop-types';
import ChromeLoader from '../../Utilities/ChromeLoader';
import {
  NO_MANAGE_USER_ACCESS_TOOLTIP_MESSAGE,
  USER_ACCESS_ADMIN_PERMISSIONS,
} from '../../constants';
import { ActionButton } from '../InventoryTable/ActionWithRBAC';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const GroupDetailInfo = () => {
  const path = '/iam/user-access';
  const { hasAccess: isUserAccessAdministrator, isLoading } = usePermissions(
    'rbac',
    USER_ACCESS_ADMIN_PERMISSIONS
  );

  return (
    <Card>
      <CardHeader
        actions={{
          actions: (
            <>
              <ActionButton
                component="a"
                href={path}
                variant="secondary"
                override={isUserAccessAdministrator}
                noAccessTooltip={NO_MANAGE_USER_ACCESS_TOOLTIP_MESSAGE}
                ouiaId="manage-access-button"
                isLoading={isLoading}
              >
                Manage access
              </ActionButton>
            </>
          ),
          hasNoOffset: false,
          className: undefined,
        }}
      >
        <CardTitle className="pf-v5-c-title pf-m-lg card-title">
          User access configuration
        </CardTitle>
      </CardHeader>
      <CardBody>
        {isUserAccessAdministrator ? (
          <span>
            Manage your workspace user access configuration under{' '}
            <a href={path}>Identity & Access Management &gt; User Access</a>.
          </span>
        ) : (
          <span>
            Manage your workspace user access configuration under Identity &
            Access Management &gt; User Access.
          </span>
        )}
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
