/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getNotificationProp } from '../Utilities/edge';
import { useDispatch } from 'react-redux';

const SystemUpdate = () => {
  const chrome = useChrome();
  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);

  useEffect(() => {
    chrome?.updateDocumentTitle?.('Groups - Inventory | RHEL');
  }, [chrome]);
  const { inventoryId } = useParams();

  return inventoryId !== null ? (
    <AsyncComponent
      appName="edge"
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
