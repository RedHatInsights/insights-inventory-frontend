import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';
import Fallback from './components/SpinnerFallback';

const InventoryApp = () => {
    const [registry, setRegistry] = useState();
    const store = registry?.getStore();

    useEffect(() => {
        setRegistry(IS_DEV ? init(logger) : init());

        return () => {
            setRegistry(undefined);
        };
    }, []);

    return (registry ? (
        <RegistryContext.Provider value={{
            getRegistry: () => registry
        }}>
            <Provider store={store}>
                <Router basename={getBaseName(window.location.pathname)}>
                    <App />
                </Router>
            </Provider>
        </RegistryContext.Provider>
    ) : <Fallback />);
};

export default InventoryApp;
