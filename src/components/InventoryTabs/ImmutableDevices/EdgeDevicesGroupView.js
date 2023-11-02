import React from 'react';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { resolveRelPath } from '../../../Utilities/path';
import {
  getNotificationProp,
  manageEdgeInventoryUrlName,
} from '../../../Utilities/edge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const EdgeDeviceGroupiew = (props) => {
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
  return (
    <AsyncComponent
      appName="edge"
      module="./DevicesGroupDetail"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      showHeaderProp={false}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeInventoryUrlName}
      notificationProp={notificationProp}
      {...props}
    />
  );
};

export default EdgeDeviceGroupiew;
