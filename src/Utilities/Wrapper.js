import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

const RenderWrapper = ({
  cmp: Component,
  isRbacEnabled,
  inventoryRef,
  store,
  ...props
}) => {
  const [allUserPermissions, setAllUserPermissions] = useState();
  const chrome = useChrome();

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
      const permissionName = obj.permission;

      user[permissionName] = true;
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

  return (
    <Component
      {...props}
      {...(inventoryRef && {
        ref: inventoryRef,
      })}
      isRbacEnabled={isRbacEnabled}
      hasAccess={
        //if there are no user permissions mapped - set access to false so the table won't trigger fetches
        //otherwise we are checking for any hosts or other permissions to read systems table
        !allUserPermissions
          ? false
          : allUserPermissions?.['inventory:hosts:read']
          ? true
          : allUserPermissions?.['inventory:*:read']
          ? true
          : false
      }
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
