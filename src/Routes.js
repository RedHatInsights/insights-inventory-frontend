import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { getSearchParams } from './constants';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import LostPage from './components/LostPage';
import axios from 'axios';
import { Bullseye, Spinner } from '@patternfly/react-core';
import AsynComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';

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
  staleness: '/staleness-and-culling',
};
const INVENTORY_TOTAL_FETCH_URL = '/api/inventory/v1/hosts';

export const Routes = () => {
  const searchParams = useMemo(() => getSearchParams(), []);
  const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');
  const [hasSystems, setHasSystems] = useState(true);
  useEffect(() => {
    try {
      axios
        .get(`${INVENTORY_TOTAL_FETCH_URL}?page=1&per_page=1`)
        .then(({ data }) => {
          setHasSystems(data.total > 0);
        });
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
      path: '/staleness-and-culling',
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
