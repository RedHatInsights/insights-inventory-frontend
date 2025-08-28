import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { getStore, updateReducers } from './store';
import RegistryContext from './store/registeryContext';
import App from './App';
import Fallback from './components/SpinnerFallback';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const InventoryApp = ({ logger }) => {
  const registry = useMemo(() => {
    const store = logger ? getStore(logger) : getStore();
    return {
      register: (newReducers) =>
        store.replaceReducer(updateReducers(newReducers)),
      getStore: () => store,
    };
  }, [logger]);

  const queryClient = useMemo(() => new QueryClient(), []);

  return registry ? (
    <RegistryContext.Provider
      value={{
        getRegistry: () => registry,
      }}
    >
      <Provider store={registry.getStore()}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
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
