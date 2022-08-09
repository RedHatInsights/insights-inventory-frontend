import { Route, Redirect, Switch } from 'react-router-dom';
import React, { lazy, Suspense, useContext, useEffect } from 'react';
import { tagsMapper } from './constants';
import { reducers, RegistryContext, tableReducer } from './store';
import { mergeWithEntities } from './store/reducers';

const InventoryTable = lazy(() => import('./routes/InventoryTable'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));

export const routes = {
    table: '/',
    detail: '/:inventoryId'
};

export const Routes = () => {
    const { getRegistry } = useContext(RegistryContext);
    useEffect(() => {
        getRegistry().register({
            ...reducers,
            ...mergeWithEntities(tableReducer)
        });
    }, [getRegistry]);
    const searchParams = new URLSearchParams(location.search);

    return (
        <Suspense fallback="">
            <Switch>
                <Route
                    exact
                    path={routes.table}
                    render={() => <InventoryTable
                        status={searchParams.getAll('status')}
                        source={searchParams.getAll('source')}
                        filterbyName={searchParams.getAll('hostname_or_id')}
                        tagsFilter={searchParams.getAll('tags')?.[0]?.split?.(',').reduce?.(tagsMapper, [])}
                        operatingSystem={searchParams.getAll('operating_system')}
                        page={searchParams.getAll('page')}
                        perPage={searchParams.getAll('per_page')}
                    />}
                    rootClass='inventory'
                />
                <Route exact path={routes.detail} component={InventoryDetail} rootClass='inventory' />
                <Redirect path="*" to="/" />
            </Switch>
        </Suspense>
    );
};
