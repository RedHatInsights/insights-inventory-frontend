import { Route, Switch, matchPath, useHistory } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { tagsMapper } from './constants';

const InventoryTable = lazy(() => import('./routes/InventoryTable'));
const InventoryDetail = lazy(() => import('./routes/InventoryDetail'));

export const routes = {
    table: '/',
    detail: '/:inventoryId'
};

function checkPaths(technology, app) {
    return Object
    .values(routes)
    .some(
        route => {
            return matchPath(location.href, { path: `${document.baseURI}${technology}/${app}${route}` });
        }
    );
}

export const Routes = () => {
    const history = useHistory();
    const pathName = window.location.pathname.split('/');
    const searchParams = new URLSearchParams(location.search);
    pathName.shift();

    if (pathName[0] === 'beta') {
        pathName.shift();
    }

    if (!checkPaths(pathName[0], pathName[1])) {
        history.push(`${routes.table}${location.search}${location.hash}`);
    }

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
                        page={searchParams.getAll('page')}
                        perPage={searchParams.getAll('per_page')}
                    />}
                    rootClass='inventory'
                />
                <Route path={routes.detail} component={InventoryDetail} rootClass='inventory' />
            </Switch>
        </Suspense>
    );
};
