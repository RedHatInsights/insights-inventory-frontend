import React, {
  Suspense,
  createContext,
  lazy,
  useEffect,
  useState,
} from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import LostPage from './components/LostPage';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import {
  inventoryHasEdgeSystems,
  inventoryHasBootcImages,
} from './Utilities/edge';
import { inventoryHasConventionalSystems } from './Utilities/conventional';
import Fallback from './components/SpinnerFallback';

const InventoryOrEdgeGroupDetailsView = lazy(() =>
  import('./routes/InventoryOrEdgeGroupDetailsComponent')
);
const InventoryOrEdgeView = lazy(() =>
  import('./routes/InventoryOrEdgeComponent')
);
const InventoryTable = lazy(() => import('./routes/InventoryPage'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));
const InventoryHostStaleness = lazy(() =>
  import('./routes/InventoryHostStaleness')
);

const EdgeInventoryUpdate = lazy(() => import('./routes/SystemUpdate'));

export const routes = {
  table: '/',
  detail: '/:inventoryId',
  detailWithModal: '/:inventoryId/:modalId',
  groups: '/groups',
  groupDetail: '/groups/:groupId',
  update: '/:inventoryId/update',
  edgeInventory: '/manage-edge-inventory',
  staleness: '/staleness-and-deletion',
  workspace: '/workspace',
  workspaceDetail: '/workspace/:groupId',
};

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
  hasBootcImages: false,
});

export const Routes = () => {
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);
  const [hasEdgeDevices, setHasEdgeDevices] = useState(true);
  const [hasBootcImages, setHasBootcImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const edgeParityInventoryListEnabled = useFeatureFlag(
    'edgeParity.inventory-list'
  );

  const stalenessAndDeletionEnabled = useFeatureFlag('hbi.custom-staleness');
  const isBifrostEnabled = useFeatureFlag('hbi.ui.bifrost');

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
      element: <RenderWrapper cmp={InventoryTable} />,
    },
    { path: '/:inventoryId', element: <InventoryDetail /> },
    { path: '/:inventoryId/:modalId', element: <InventoryDetail /> },
    {
      path: '/groups',
      element: <InventoryOrEdgeView />,
    },
    {
      path: '/groups/:groupId',
      element: <InventoryOrEdgeGroupDetailsView />,
    },
    {
      path: '/workspaces',
      element: <InventoryOrEdgeView />,
    },
    {
      path: '/workspaces/:groupId',
      element: <InventoryOrEdgeGroupDetailsView />,
    },
    {
      path: '/:inventoryId/update',
      element: <EdgeInventoryUpdate />,
    },
    {
      path: '/manage-edge-inventory',
      element: (
        <RenderWrapper cmp={InventoryTable} isRbacEnabled isImmutableTabOpen />
      ),
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
    {
      path: '/staleness-and-deletion',
      element: stalenessAndDeletionEnabled ? (
        <InventoryHostStaleness />
      ) : (
        <LostPage />
      ),
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
        appName="dashboard"
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
      }}
    >
      {element}
    </AccountStatContext.Provider>
  );
};
