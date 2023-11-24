import React, {
  Suspense,
  createContext,
  lazy,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { getSearchParams } from './constants';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import LostPage from './components/LostPage';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { inventoryHasEdgeSystems } from './Utilities/edge';
import { inventoryHasConventionalSystems } from './Utilities/conventional';
const InventoryOrEdgeGroupDetailsView = lazy(() =>
  import('./routes/InventoryOrEdgeGroupDetailsComponent')
);
const InventoryOrEdgeView = lazy(() =>
  import('./routes/InventoryOrEdgeComponent')
);
const InventoryTable = lazy(() => import('./routes/InventoryTable'));
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
};

export const AccountStatContext = createContext({
  hasConventionalSystems: true,
  hasEdgeDevices: false,
});

export const Routes = () => {
  const searchParams = useMemo(() => getSearchParams(), []);
  const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);
  const [hasEdgeDevices, setHasEdgeDevices] = useState(true);
  const edgeParityInventoryListEnabled = useFeatureFlag(
    'edgeParity.inventory-list'
  );
  useEffect(() => {
    try {
      (async () => {
        const hasConventionalSystems = await inventoryHasConventionalSystems();
        if (edgeParityInventoryListEnabled) {
          const hasEdgeSystems = await inventoryHasEdgeSystems();
          setHasConventionalSystems(hasConventionalSystems);
          setHasEdgeDevices(hasEdgeSystems);
        }
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  let element = useRoutes([
    {
      path: '/',
      element: <RenderWrapper cmp={InventoryTable} {...searchParams} />,
    },
    { path: '/:inventoryId', element: <InventoryDetail /> },
    { path: '/:inventoryId/:modalId', element: <InventoryDetail /> },
    {
      path: '/groups',
      element: groupsEnabled ? <InventoryOrEdgeView /> : <LostPage />,
    },
    {
      path: '/groups/:groupId',
      element: groupsEnabled ? (
        <InventoryOrEdgeGroupDetailsView />
      ) : (
        <LostPage />
      ),
    },
    {
      path: '/:inventoryId/update',
      element: <EdgeInventoryUpdate />,
    },
    {
      path: '/manage-edge-inventory',
      element: (
        <RenderWrapper
          cmp={InventoryTable}
          isRbacEnabled
          {...searchParams}
          isImmutableTabOpen
        />
      ),
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
    {
      path: '/staleness-and-deletion',
      element: groupsEnabled ? <InventoryHostStaleness /> : <LostPage />,
    },
  ]);

  const hasSystems = edgeParityInventoryListEnabled
    ? hasEdgeDevices || hasConventionalSystems
    : hasConventionalSystems;

  return !hasSystems ? (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
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
      value={{ hasConventionalSystems, hasEdgeDevices }}
    >
      {element}
    </AccountStatContext.Provider>
  );
};
