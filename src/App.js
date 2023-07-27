import React from 'react';
import { InventoryRoutes } from './Routes';
import './App.scss';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';

const App = () => {
  return (
    <div className="inventory">
      <NotificationsPortal />
      <RBACProvider appName="inventory" checkResourceDefinitions>
        <InventoryRoutes />
      </RBACProvider>
    </div>
  );
};

export default App;
