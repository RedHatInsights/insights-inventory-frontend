import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import useSystemsTableFeatureFlag from './routes/Systems/components/SystemsTable/hooks/useSystemsTableFeatureFlag';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import {
  inventoryHasEdgeSystems,
  inventoryHasBootcImages,
} from './Utilities/edge';
import { inventoryHasConventionalSystems } from './Utilities/conventional';
import Fallback from './components/SpinnerFallback';
import Redirect from './Utilities/Redirect';
import { AccountStatContext } from './Contexts';

const InventoryTable = lazy(() => import('./routes/InventoryPage'));
const Systems = lazy(() => import('./routes/Systems'));

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
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);
  const [hasEdgeDevices, setHasEdgeDevices] = useState(true);
  const [hasBootcImages, setHasBootcImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const edgeParityInventoryListEnabled = useFeatureFlag(
    'edgeParity.inventory-list',
  );
  const isSystemsTableEnabled = useSystemsTableFeatureFlag();
  const isBifrostEnabled = useFeatureFlag('hbi.ui.bifrost');
  const isKesselEnabled = useFeatureFlag('hbi.kessel-migration');
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter',
  );
  const isLastCheckInEnabled = useFeatureFlag(
    'hbi.create_last_check_in_update_per_reporter_staleness',
  );
  useEffect(() => {
    // zero state check
    (async () => {
      try {
        const hasConventionalSystems = await inventoryHasConventionalSystems();
        setHasConventionalSystems(hasConventionalSystems);

        if (edgeParityInventoryListEnabled) {
          const hasEdgeSystems = await inventoryHasEdgeSystems();
          setHasEdgeDevices(hasEdgeSystems);
        }

        if (isBifrostEnabled) {
          const hasBootc = await inventoryHasBootcImages();
          setHasBootcImages(hasBootc);
        }
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
      element: isSystemsTableEnabled ? (
        <Systems />
      ) : (
        <RenderWrapper cmp={InventoryTable} />
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

  //bootc images are part of conventional systems,
  //zero-state is not influenced by them
  const hasSystems = edgeParityInventoryListEnabled
    ? hasEdgeDevices || hasConventionalSystems
    : hasConventionalSystems;

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
        hasConventionalSystems,
        hasEdgeDevices,
        hasBootcImages,
        isKesselEnabled,
        edgeParityFilterDeviceEnabled,
        isLastCheckInEnabled,
      }}
    >
      {element}
    </AccountStatContext.Provider>
  );
};
