import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import { INVENTORY_ROOT } from './config';

import AlertsContainer from './containers/AlertsContainer';

class App extends Component {

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp(INVENTORY_ROOT);
        insights.chrome.navigation(buildNavigation());

        this.appNav = insights.chrome.on('APP_NAVIGATION', event => this.props.history.push(`/${event.navId}`));
        this.buildNav = this.props.history.listen(() => insights.chrome.navigation(buildNavigation()));
    }

    componentWillUnmount() {
        this.appNav();
        this.buildNav();
    }

    render () {
        return (
            <React.Fragment>
                <AlertsContainer/>
                <Routes childProps={this.props} />
            </React.Fragment>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter (connect()(App));

function buildNavigation () {
    const currentPath = `${INVENTORY_ROOT}/${window.location.pathname.split('/').slice(-1)[0]}`;
    return [{
        title: 'Entities',
        id: `${INVENTORY_ROOT}/entity`
    }].map(item => ({
        ...item,
        active: item.id === currentPath
    }));
}
