import React from 'react';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { resolveRelPath } from '../../Utilities/path';
import { getNotificationProp } from '../../Utilities/edge';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const EdgeGroupsDetailsView = (props) => {
  const addNotification = useAddNotification();
  const notificationProp = getNotificationProp(addNotification);
  return (
    <AsyncComponent
      scope="edge"
      module="./GroupsDetails"
      ErrorComponent={<ErrorState />}
      navigateProp={useNavigate}
      locationProp={useLocation}
      paramsProp={useParams}
      notificationProp={notificationProp}
      pathPrefix={resolveRelPath('')}
      {...props}
    />
  );
};

export default EdgeGroupsDetailsView;
