import React from 'react';
import { Routes } from './Routes';
import './App.scss';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { useKesselMigrationFeatureFlag } from './Utilities/hooks/useKesselMigrationFeatureFlag';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { KesselMigrationProvider } from './Contexts/KesselMigrationContext';

const App = () => {
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();

  return (
    <div className="inventory">
      <KesselMigrationProvider>
        {isKesselMigrationEnabled ? (
          <AccessCheck.Provider
            baseUrl={window.location.origin}
            apiPath="/api/inventory/v1beta2"
          >
            <NotificationsProvider>
              <Routes />
            </NotificationsProvider>
          </AccessCheck.Provider>
        ) : (
          <RBACProvider
            appName={null /* fetch permissions from all scopes */}
            checkResourceDefinitions
          >
            <NotificationsProvider>
              <Routes />
            </NotificationsProvider>
          </RBACProvider>
        )}
      </KesselMigrationProvider>
    </div>
  );
};

export default App;
