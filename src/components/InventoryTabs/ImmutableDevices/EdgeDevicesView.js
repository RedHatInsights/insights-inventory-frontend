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

const ImmutableDevicesView = (props) => {
  const addNotification = useAddNotification();
  const notificationProp = getNotificationProp(addNotification);
  return (
    <AsyncComponent
      scope="edge"
      module="./DevicesView"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      urlName={manageEdgeInventoryUrlName}
      {...props}
    />
  );
};

export default ImmutableDevicesView;
