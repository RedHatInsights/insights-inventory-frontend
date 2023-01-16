import { Route, Redirect, Switch } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { getSearchParams } from './constants';
import RenderWrapper from './Utilities/Wrapper';

const InventoryTable = lazy(() => import('./routes/InventoryTable'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));

export const routes = {
    table: '/',
    detail: '/:inventoryId',
    detailWithModal: '/:inventoryId/:modalId'
};

export const Routes = () => {
    const searchParams = getSearchParams();
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
                <Route exact path={routes.detailWithModal} component={InventoryDetail} rootClass='inventory' />
                <Route exact path={routes.detail} component={InventoryDetail} rootClass='inventory' />
                <Redirect path="*" to="/" />
            </Switch>
        </Suspense>
    );
};
