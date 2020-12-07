import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/files/helpers';
import logger from 'redux-logger';

const InventoryApp = ({ useLogger }) => {
    return (
        <Provider store={(useLogger ? init(logger) : init()).getStore()}>
            <Router basename={getBaseName(window.location.pathname)}>
                <App />
            </Router>
        </Provider>
    );
};

InventoryApp.propTypes = {
    useLogger: PropTypes.bool
};

InventoryApp.defaultProps = {
    useLogger: false
};

export default InventoryApp;

