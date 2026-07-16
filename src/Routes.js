import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import useSystemsViewFeatureFlag from './Utilities/useSystemsViewFeatureFlag';
import useLegacyInventoryTableFeatureFlag from './Utilities/useLegacyInventoryTableFeatureFlag';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import {
  inventoryHasBootcImages,
  inventoryHasConventionalSystems,
} from './Utilities/systemsChecks';
import Fallback from './components/SpinnerFallback';
import Redirect from './Utilities/Redirect';
import { AccountStatContext } from './Contexts';

const InventoryPage = lazy(() => import('./routes/InventoryPage'));
const InventoryViews = lazy(() => import('./routes/InventoryViews'));

const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));
const InventoryHostStaleness = lazy(
  () => import('./routes/InventoryHostStaleness'),
);

const InventoryGroupDetail = lazy(
  () => import('./routes/InventoryGroupDetail'),
);
const InventoryGroups = lazy(() => import('./routes/InventoryGroups'));
export const routes = {
  table: '/',
  detail: '/:inventoryId',
  detailWithModal: '/:inventoryId/:modalId',
  groups: '/groups',
  groupDetail: '/groups/:groupId',
  staleness: '/staleness-and-deletion',
  workspace: '/workspaces',
  workspaceDetail: '/workspaces/:groupId',
};
export const Routes = () => {
  const [hasSystems, setHasSystems] = useState(true);
  const [hasBootcImages, setHasBootcImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isSystemsViewEnabled = useSystemsViewFeatureFlag();
  const isLastCheckInEnabled = useFeatureFlag(
    'hbi.create_last_check_in_update_per_reporter_staleness',
  );
  const isLegacyInventoryTableEnabled = useLegacyInventoryTableFeatureFlag();

  useEffect(() => {
    (async () => {
      try {
        const hasConventionalSystems = await inventoryHasConventionalSystems();
        setHasSystems(hasConventionalSystems);
        const hasBootc = await inventoryHasBootcImages();
        setHasBootcImages(hasBootc);
        setIsLoading(false);
      } catch (error) {
        console.error(error);

        if (error.response.status === 403) {
          setIsLoading(false);
        }
      }
    })();
  }, []);

  let element = useRoutes([
    {
      path: '/',
      element:
        isSystemsViewEnabled && !isLegacyInventoryTableEnabled ? (
          <RenderWrapper cmp={InventoryViews} />
        ) : (
          <RenderWrapper cmp={InventoryPage} />
        ),
    },
    { path: '/:inventoryId', element: <InventoryDetail /> },
    { path: '/:inventoryId/:modalId', element: <InventoryDetail /> },
    {
      path: '/groups',
      element: (
        <Redirect to="/insights/inventory/workspaces" replace="replace" />
      ),
    },
    {
      path: '/groups/:groupId',
      element: (
        <Redirect
          to="/insights/inventory/workspaces/:groupId"
          replace="replace"
        />
      ),
    },
    {
      path: '/workspaces',
      element: <InventoryGroups />,
    },
    {
      path: '/workspaces/:groupId',
      element: <InventoryGroupDetail />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
    {
      path: '/staleness-and-deletion',
      element: <InventoryHostStaleness />,
    },
  ]);

  if (isLoading) {
    return <Fallback />;
  }

  return !hasSystems ? (
    <Suspense fallback={<Fallback />}>
      <AsyncComponent
        appId={'inventory_zero_state'}
        module="./AppZeroState"
        scope="dashboard"
        ErrorComponent={<ErrorState />}
        app="Inventory"
      />
    </Suspense>
  ) : (
    <AccountStatContext.Provider
      value={{
        hasConventionalSystems: hasSystems,
        hasBootcImages,
        isLastCheckInEnabled,
      }}
    >
      {element}
    </AccountStatContext.Provider>
  );
};
