import React from 'react';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { resolveRelPath } from '../../Utilities/path';
import { getNotificationProp } from '../../Utilities/edge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const EdgeUpdateDeviceModal = (props) => {
  const addNotification = useAddNotification();
  const notificationProp = getNotificationProp(addNotification);
  return (
    <AsyncComponent
      scope="edge"
      module="./UpdateDeviceModal"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      fallback={null}
      {...props}
    />
  );
};

export default EdgeUpdateDeviceModal;
