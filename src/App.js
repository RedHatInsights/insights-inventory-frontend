import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import { INVENTORY_ROOT } from './config';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import registryDecorator from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { reducers } from './store';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';
import PermissionLoader from './components/PermissionsLoader';

@registryDecorator()
class App extends Component {
    constructor(props) {
        super(props);
        this.getRegistry().register(reducers);
    }

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp(INVENTORY_ROOT);
        this.appNav = insights.chrome.on(
            'APP_NAVIGATION',
            event => this.props.history.push(`/${event.navId}${location.search}${location.hash}`)
        );
    }

    componentWillUnmount() {
        this.appNav();
    }

    render () {
        return (
            <div className="inventory">
                <NotificationsPortal />
                <PermissionLoader />
                <Routes childProps={this.props} />
            </div>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

/**
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default routerParams(connect()(App));
