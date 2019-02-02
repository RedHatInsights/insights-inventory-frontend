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

function checkPaths() {
    return Object
    .values(routes)
    .some(
        route => matchPath(location.href, { path: `${document.baseURI}platform/inventory${route}` })
    );
}

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = ({ childProps: { history } }) => {
    if (!checkPaths()) {
        history.push(routes.table);
    }

    return (
        <Switch>
            <InsightsRoute exact path={routes.table} component={InventoryTable} rootClass='inventory' />
            <InsightsRoute path={routes.detail} component={InventoryDetail} rootClass='inventory' />
        </Switch>
    );
};

Routes.propTypes = {
    childProps: PropTypes.shape({
        history: PropTypes.shape({
            push: PropTypes.func
        })
    })
};
