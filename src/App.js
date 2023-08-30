/* eslint-disable rulesdir/disallow-fec-relative-imports */
import React from 'react';
import { Routes } from './Routes';
import './App.scss';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';

const App = () => {
  return (
    <div className="inventory">
      <NotificationsPortal />
      <RBACProvider
        appName={null /* fetch permissions from all scopes */}
        checkResourceDefinitions
      >
        <Routes />
      </RBACProvider>
    </div>
  );
};

export default App;
