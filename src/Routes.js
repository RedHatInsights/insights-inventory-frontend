import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import InventoryTable from './routes/InventoryTable';
import InventoryDetail from './routes/InventoryDetail';

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-l-page__main');

    return (<Route {...rest} component={Component}/>);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = () => {
    return (
        <Switch>
            <InsightsRoute exact path='/entity' component={InventoryTable} rootClass='inventory' />
            <InsightsRoute path='/entity/:inventoryId' component={InventoryDetail} rootClass='inventory' />
            <Redirect to="/entity" />
        </Switch>
    );
};
