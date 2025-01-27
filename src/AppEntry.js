import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { getStore, updateReducers } from './store';
import RegistryContext from './store/registeryContext';
import App from './App';
import Fallback from './components/SpinnerFallback';

const InventoryApp = ({ logger }) => {
  const registry = useMemo(() => {
    const store = logger ? getStore(logger) : getStore();
    return {
      register: (newReducers) =>
        store.replaceReducer(updateReducers(newReducers)),
      getStore: () => store,
    };
  }, [logger]);

  return registry ? (
    <RegistryContext.Provider
      value={{
        getRegistry: () => registry,
      }}
    >
      <Provider store={registry.getStore()}>
        <App />
      </Provider>
    </RegistryContext.Provider>
  ) : (
    <Fallback />
  );
};

InventoryApp.propTypes = {
  logger: PropTypes.object,
};

export default InventoryApp;
