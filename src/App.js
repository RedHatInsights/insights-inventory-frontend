import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import { INVENTORY_ROOT } from './config';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import registryDecorator from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { reducers } from './store';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';
import { IntlProvider } from  '@redhat-cloud-services/frontend-components-translations';
import messages from '../locales/data';
@registryDecorator()
class App extends Component {
    constructor(props) {
        super(props);
        this.getRegistry().register(reducers);
    }

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp(INVENTORY_ROOT);
        this.appNav = insights.chrome.on('APP_NAVIGATION', event => this.props.history.push(`/${event.navId}`));
    }

    componentWillUnmount() {
        this.appNav();
    }

    render () {
        return (
            <IntlProvider messages={messages}>
                <React.Fragment>
                    <NotificationsPortal />
                    <Routes childProps={this.props} />
                </React.Fragment>
            </IntlProvider>
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
