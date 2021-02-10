import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';

const InventoryApp = ({ useLogger }) => {
    const registry = useLogger ? init(logger) : init();
    return <RegistryContext.Provider value={{
        getRegistry: () => registry
    }}>
        <Provider store={registry.getStore()}>
            <Router basename={getBaseName(window.location.pathname)}>
                <App />
            </Router>
        </Provider>
    </RegistryContext.Provider>;
};

InventoryApp.propTypes = {
    useLogger: PropTypes.bool
};

InventoryApp.defaultProps = {
    useLogger: false
};

export default InventoryApp;
