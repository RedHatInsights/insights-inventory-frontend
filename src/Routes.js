import { Redirect, Route, Switch } from 'react-router-dom';
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
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
  return (
    <Suspense fallback="">
      {!hasSystems ? (
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
        <Switch>
          <Route
            exact
            path={routes.update}
            component={EdgeInventoryUpdate}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.table}
            render={() => (
              <RenderWrapper cmp={InventoryTable} {...searchParams} />
            )}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.edgeInventory}
            render={() => (
              <RenderWrapper
                cmp={InventoryTable}
                isRbacEnabled
                {...searchParams}
              />
            )}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.groups}
            component={groupsEnabled ? InventoryGroups : LostPage}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.groupDetail}
            component={groupsEnabled ? InventoryGroupDetail : LostPage}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.detailWithModal}
            component={InventoryDetail}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.detail}
            component={InventoryDetail}
            rootClass="inventory"
          />
          <Route
            exact
            path={routes.manageEdgeInventoryUrlName}
            component={InventoryTable}
            rootClass="inventory"
          />
          <Redirect path="*" to="/" />
        </Switch>
      )}
    </Suspense>
  );
};
