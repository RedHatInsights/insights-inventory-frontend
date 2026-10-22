import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';

import { RouteList } from './Routes';
import './RegistrationApp.scss';

const RegistrationApp = (props) => {
  const chrome = useChrome();

  useEffect(() => {
    chrome?.hideGlobalFilter?.();
  }, [chrome]);

  return (
    <NotificationsProvider>
      <RouteList childProps={props} />
    </NotificationsProvider>
  );
};

export default RegistrationApp;
