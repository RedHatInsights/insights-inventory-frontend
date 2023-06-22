/* eslint-disable rulesdir/disallow-fec-relative-imports */
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Routes } from './Routes';
import './App.scss';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { RBACProvider } from '@redhat-cloud-services/frontend-components';

const App = () => {
  const history = useHistory();
  const chrome = useChrome();
  useEffect(() => {
    return chrome.on('APP_NAVIGATION', (event) => {
      if (event.navId === 'inventory') {
        history.push(`/${location.search}${location.hash}`);
      } else {
        history.push(`/${event.navId}${location.search}${location.hash}`);
      }
    });
  }, []);

  return (
    <div className="inventory">
      <NotificationsPortal />
      <RBACProvider appName="inventory">
        <Routes />
      </RBACProvider>
    </div>
  );
};

export default App;
