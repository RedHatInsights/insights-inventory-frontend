import React from 'react';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { resolveRelPath } from '../../../Utilities/path';
import {
  getNotificationProp,
  manageEdgeInventoryUrlName,
} from '../../../Utilities/edge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const ImmutableDevicesTab = () => {
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
  return (
    <AsyncComponent
      appName="edge"
      module="./Inventory"
      navigateProp={useNavigate}
      locationProp={useLocation}
      showHeaderProp={false}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeInventoryUrlName}
      notificationProp={notificationProp}
    />
  );
};

export default ImmutableDevicesTab;
