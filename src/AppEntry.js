import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { getStore, updateReducers } from './store';
import RegistryContext from './store/registeryContext';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';
import Fallback from './components/SpinnerFallback';

const InventoryApp = () => {
    const registry = useMemo(() => {
        const store = IS_DEV ? getStore(logger) : getStore();
        return {
            register: (newReducers) => store.replaceReducer(updateReducers(newReducers)),
            getStore: () => store
        };
    }, []);

    return (registry ? (
        <RegistryContext.Provider value={{
            getRegistry: () => registry
        }}>
            <Provider store={registry.getStore()}>
                <Router basename={getBaseName(window.location.pathname)}>
                    <App />
                </Router>
            </Provider>
        </RegistryContext.Provider>
    ) : <Fallback />);
};

export default InventoryApp;
