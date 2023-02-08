import { Route, Redirect, Switch } from 'react-router-dom';
import React, { lazy, Suspense, useMemo } from 'react';
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { InvalidObject } from '@redhat-cloud-services/frontend-components';
import { getSearchParams } from './constants';
import RenderWrapper from './Utilities/Wrapper';
import useFeatureFlag from './Utilities/useFeatureFlag';

const InventoryTable = lazy(() => import('./routes/InventoryTable'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));
const InventoryGroups = lazy(() => import('./routes/InventoryGroups'));

export const routes = {
    table: '/',
    detail: '/:inventoryId',
    detailWithModal: '/:inventoryId/:modalId',
    groups: '/groups'
};

export const Routes = () => {
    const searchParams = useMemo(() => getSearchParams(), []);
    const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');

    return (
        <Suspense fallback="">
            <Switch>
                <Route
                    exact
                    path={routes.table}
                    render={() =>
                        <RenderWrapper
                            cmp={InventoryTable}
                            isRbacEnabled
                            {...searchParams}
                        />}
                    rootClass='inventory'
                />
                <Route
                    exact
                    path={routes.groups}
                    component={
                        groupsEnabled
                            ? InventoryGroups
                            : () => (
                                <EmptyState>
                                    <EmptyStateBody>
                                        <InvalidObject />
                                    </EmptyStateBody>
                                </EmptyState>
                            )
                    }
                    rootClass="inventory"
                />
                <Route exact path={routes.detailWithModal} component={InventoryDetail} rootClass='inventory' />
                <Route exact path={routes.detail} component={InventoryDetail} rootClass='inventory' />
                <Redirect path="*" to="/" />
            </Switch>
        </Suspense>
    );
};
