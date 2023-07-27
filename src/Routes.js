import { Route, Routes, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { Suspense, lazy, useMemo } from 'react';
import { getSearchParams } from './Utilities/sharedFunctions';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import LostPage from './components/LostPage';
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

const SuspenseWrapped = ({ Component }) => (
  <Suspense>
    <Component />
  </Suspense>
);

export const InventoryRoutes = () => {
  const location = useLocation();
  const searchParams = useMemo(() => getSearchParams(location), []);
  const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');

  return (
    <Routes>
      <Route
        exact
        path={routes.update}
        component={<SuspenseWrapped Component={EdgeInventoryUpdate} />}
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.table}
        element={
          <SuspenseWrapped
            Component={() => (
              <RenderWrapper cmp={InventoryTable} {...searchParams} />
            )}
          />
        }
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.edgeInventory}
        element={
          <SuspenseWrapped
            Component={() => (
              <RenderWrapper
                cmp={InventoryTable}
                isRbacEnabled
                {...searchParams}
              />
            )}
          />
        }
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.groups}
        element={
          <SuspenseWrapped
            Component={groupsEnabled ? InventoryGroups : LostPage}
          />
        }
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.groupDetail}
        element={
          <SuspenseWrapped
            Component={groupsEnabled ? InventoryGroupDetail : LostPage}
          />
        }
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.detailWithModal}
        element={<SuspenseWrapped Component={InventoryDetail} />}
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.detail}
        element={<SuspenseWrapped Component={InventoryDetail} />}
        rootClass="inventory"
      />
      <Route
        exact
        path={routes.manageEdgeInventoryUrlName}
        element={<SuspenseWrapped Component={InventoryTable} />}
        rootClass="inventory"
      />
    </Routes>
  );
};
SuspenseWrapped.propTypes = {
  Component: PropTypes.element,
};
