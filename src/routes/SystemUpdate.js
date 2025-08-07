import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getNotificationProp } from '../Utilities/edge';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const SystemUpdate = () => {
  const chrome = useChrome();
  const addNotification = useAddNotification();
  const notificationProp = getNotificationProp(addNotification);

  useEffect(() => {
    chrome?.updateDocumentTitle?.(`Workspaces - Inventory`);
  }, [chrome]);
  const { inventoryId } = useParams();

  return inventoryId !== null ? (
    <AsyncComponent
      scope="edge"
      module="./UpdateSystem"
      navigateProp={useNavigate}
      locationProp={useLocation}
      notificationProp={notificationProp}
      paramsProp={useParams}
      inventoryId={inventoryId}
    />
  ) : (
    <></>
  );
};

export default SystemUpdate;
