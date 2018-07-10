import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import some from 'lodash/some';
import Inventory from './SmartComponents/Inventory/Inventory';

const paths = {
    inventory: '/inventory'
};

type Props = {
    childProps: any
};

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`);

    return (<Component {...rest} />);
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
export const Routes = (props: Props) => {
    const path = props.childProps.location.pathname;

    return (
        <Switch>
            <InsightsRoute exact path={paths.inventory} component={Inventory} rootClass='inventory' />
            {/* Finally, catch all unmatched routes */}
            <Route render={() => some(paths, p => p === path) ? null : (<Redirect to={paths.inventory} />)} />
        </Switch>
    );
};
