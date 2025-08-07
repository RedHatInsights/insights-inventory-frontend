import React from 'react';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { resolveRelPath } from '../../../Utilities/path';
import {
  getNotificationProp,
  manageEdgeInventoryUrlName,
} from '../../../Utilities/edge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const EdgeDeviceGroupiew = (props) => {
  const addNotification = useAddNotification();
  const notificationProp = getNotificationProp(addNotification);
  return (
    <AsyncComponent
      scope="edge"
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
