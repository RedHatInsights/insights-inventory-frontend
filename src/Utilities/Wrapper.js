import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS } from '../constants';

const RenderWrapper = ({
  cmp: Component,
  isRbacEnabled,
  inventoryRef,
  store,
  ...props
}) => {
  const [allUserPermissions, setAllUserPermissions] = useState();
  const [permissionsForGranularHosts, setPermissionForGranularHosts] =
    useState();
  const chrome = useChrome();
  const { hasAccess } = usePermissionsWithContext([
    'inventory:*:read',
    'inventory:hosts:read',
  ]);

  //this is used to get all user permissions without HOOKS
  const getUserRbacPermissions = () => {
    try {
      return chrome.getUserPermissions('inventory');
    } catch (e) {
      throw new Error(`Error getting user permissions: ${e.message}`);
    }
  };

  //we get the data from the chrome.getUserPermissions and map it to object named user
  //then we return a user object
  function mapRbacPermissionsToUser(permissionArray) {
    const user = {};

    for (const obj of permissionArray) {
      // Extract the permission name without colons and in camel case
      const permissionName = obj.permission
        .split(':')
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join('');

      user[permissionName] = true;

      if (obj.resourceDefinitions && Array.isArray(obj.resourceDefinitions)) {
        user.granularPermissionDetails = user.granularPermissionDetails || [];

        for (const resource of obj.resourceDefinitions) {
          if (
            resource.attributeFilter &&
            resource.attributeFilter.key === 'group.id' &&
            Array.isArray(resource.attributeFilter.value)
          ) {
            user.granularPermissionDetails.push({
              key: resource.attributeFilter.key,
              operation: resource.attributeFilter.operation,
              value: resource.attributeFilter.value,
            });
          }
        }
      }
    }

    return user;
  }

  //this useEffect trigger once on the page load, get user permissions from the promise
  //then trigger mapping function and set's user permission data to useState
  //that way we can get the data from the rbac early and work with the group ID's before we request API or call Hooks
  useEffect(() => {
    async function getUserPermissionData() {
      const data = await getUserRbacPermissions();
      const mappedData = mapRbacPermissionsToUser(data);
      setAllUserPermissions(mappedData);
    }
    getUserPermissionData();
  }, []);

  useEffect(() => {
    const { hasAccess: canViewHosts } = usePermissionsWithContext(
      REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(
        allUserPermissions?.granularPermissionDetails?.[0].value
      )
    );
    setPermissionForGranularHosts(canViewHosts);
    console.log(allUserPermissions, 'allUserPermissions');
  }, [allUserPermissions]);
  console.log(permissionsForGranularHosts, 'permissionsForGranularHosts');

  return (
    <Component
      {...props}
      {...(inventoryRef && {
        ref: inventoryRef,
      })}
      isRbacEnabled={isRbacEnabled}
      hasAccess={hasAccess}
      store={store}
    />
  );
};

RenderWrapper.propTypes = {
  cmp: PropTypes.any,
  inventoryRef: PropTypes.any,
  store: PropTypes.object,
  customRender: PropTypes.bool,
  isRbacEnabled: PropTypes.bool,
};

export default RenderWrapper;
