import React from 'react';
import { Routes } from './Routes';
import './App.scss';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';

const App = () => {
  return (
    <div className="inventory">
      <RBACProvider
        appName={null /* fetch permissions from all scopes */}
        checkResourceDefinitions
      >
        <NotificationsProvider>
          <Routes />
        </NotificationsProvider>
      </RBACProvider>
    </div>
  );
};

export default App;
