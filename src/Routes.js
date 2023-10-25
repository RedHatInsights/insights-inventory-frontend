import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { getSearchParams } from './constants';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import LostPage from './components/LostPage';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { inventoryHasEdgeSystems } from './Utilities/edge';
import { inventoryHasConventionalSystems } from './Utilities/conventional';

const InventoryTable = lazy(() => import('./routes/InventoryTable'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));
const InventoryGroups = lazy(() => import('./routes/InventoryGroups'));
const InventoryHostStaleness = lazy(() =>
  import('./routes/InventoryHostStaleness')
);

const InventoryGroupDetail = lazy(() =>
  import('./routes/InventoryGroupDetail')
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

export const Routes = () => {
  const searchParams = useMemo(() => getSearchParams(), []);
  const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');
  const [hasSystems, setHasSystems] = useState(true);
  const edgeParityInventoryListEnabled = useFeatureFlag(
    'edgeParity.inventory-list'
  );
  useEffect(() => {
    try {
      (async () => {
        const hasConventionalSystems = await inventoryHasConventionalSystems();
        if (edgeParityInventoryListEnabled) {
          const hasEdgeSystems = await inventoryHasEdgeSystems();
          setHasSystems(hasConventionalSystems || hasEdgeSystems);
        } else {
          setHasSystems(hasConventionalSystems);
        }
      })();
    } catch (e) {
      console.log(e);
    }
  }, [hasSystems]);

  let element = useRoutes([
    {
      path: '/',
      element: <RenderWrapper cmp={InventoryTable} {...searchParams} />,
    },
    { path: '/:inventoryId', element: <InventoryDetail /> },
    { path: '/:inventoryId/:modalId', element: <InventoryDetail /> },
    {
      path: '/groups',
      element: groupsEnabled ? <InventoryGroups /> : <LostPage />,
    },
    {
      path: '/groups/:groupId',
      element: groupsEnabled ? <InventoryGroupDetail /> : <LostPage />,
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

  return !hasSystems ? (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      <AsynComponent
        appId={'inventory_zero_state'}
        appName="dashboard"
        module="./AppZeroState"
        scope="dashboard"
        ErrorComponent={<ErrorState />}
        app="Inventory"
      />
    </Suspense>
  ) : (
    element
  );
};
