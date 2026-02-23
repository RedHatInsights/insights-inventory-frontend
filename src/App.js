import React from 'react';
import { Routes } from './Routes';
import './App.scss';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { useKesselMigrationFeatureFlag } from './Utilities/hooks/useKesselMigrationFeatureFlag';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { KESSEL_API_PATH } from './constants';

const App = () => {
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();

  return (
    <div className="inventory">
      {/* AccessCheck.Provider is always mounted so useSelfAccessCheck (e.g. via useHostIdsWithKessel)
          never throws when the flag is off. When the flag is off we use RBAC for auth. */}
      <AccessCheck.Provider
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        apiPath={KESSEL_API_PATH}
      >
        {isKesselMigrationEnabled ? (
          <NotificationsProvider>
            <Routes />
          </NotificationsProvider>
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
      </AccessCheck.Provider>
    </div>
  );
};

export default App;
