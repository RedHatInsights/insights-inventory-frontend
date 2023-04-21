import { Route, Routes, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import React, { Suspense, lazy, useMemo } from 'react';
import { getSearchParams } from './constants';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';
import LostPage from './components/LostPage';
const InventoryTable = lazy(() => import('./routes/InventoryTable'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));
const InventoryGroups = lazy(() => import('./routes/InventoryGroups'));
const InventoryGroupDetail = lazy(() => import('./routes/InventoryGroupDetail'));

export const routes = {
    table: '/',
    detail: '/:inventoryId/*',
    groups: '/groups',
    groupDetail: '/groups/:groupId'
};

const SuspenseWrapped = ({ Component }) => (
    <Suspense>
        <Component />
    </Suspense>
);

export const InventoryRoutes = () => {
    const searchParams = useMemo(() => getSearchParams(), []);
    const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');

    return (
        <Routes>
            <Route
                exact
                path={routes.table}
                element={<Suspense>
                    <RenderWrapper
                        cmp={InventoryTable}
                        isRbacEnabled
                        {...searchParams}
                    />
                </Suspense>}
                rootClass='inventory'
            />
            <Route
                path={routes.groups}
                element={<SuspenseWrapped Component={groupsEnabled ? InventoryGroups : LostPage} />}
                rootClass="inventory"
            />
            <Route
                exact
                path={routes.groupDetail}
                element={<SuspenseWrapped Component={groupsEnabled ? <InventoryGroupDetail/> : LostPage} />}
                rootClass="inventory"
            />
            <Route
                exact
                path={routes.detail}
                element={<SuspenseWrapped Component={InventoryDetail} />}
                rootClass='inventory'
            />
            <Route
                key={'Inventory'}
                path="/"
                element={<Navigate replace to="../inventory" />}
            ></Route>
        </Routes>
    );
};

SuspenseWrapped.propTypes = {
    Component: PropTypes.element
};
