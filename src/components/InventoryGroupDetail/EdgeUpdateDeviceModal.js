import React from 'react';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { resolveRelPath } from '../../Utilities/path';
import { getNotificationProp } from '../../Utilities/edge';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const EdgeUpdateDeviceModal = (props) => {
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
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
