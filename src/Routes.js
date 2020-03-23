import { Route, Switch, matchPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import InventoryTable from './routes/InventoryTable';
import InventoryDetail from './routes/InventoryDetail';

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');
    root.classList.add(`page__${rootClass}`, 'pf-l-page__main');

    return (<Route {...rest} component={Component}/>);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

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

export const Routes = ({ childProps: { history } }) => {
    const pathName = window.location.pathname.split('/');
    const searchParams = new URLSearchParams(location.search);
    pathName.shift();

    if (pathName[0] === 'beta') {
        pathName.shift();
    }

    if (!checkPaths(pathName[0], pathName[1])) {
        history.push(routes.table + location.search);
    }

    return (
        <Switch>
            <InsightsRoute
                exact
                path={routes.table}
                render={() => <InventoryTable status={searchParams.getAll('status')} />}
                rootClass='inventory'
            />
            <InsightsRoute path={routes.detail} component={InventoryDetail} rootClass='inventory' />
        </Switch>
    );
};

Routes.propTypes = {
    childProps: PropTypes.shape({
        history: PropTypes.shape({
            push: PropTypes.func,
            location: PropTypes.shape({
                search: PropTypes.string
            })
        })
    })
};
