import React from 'react';
import { Provider } from 'react-redux';

import { init, RegistryContext } from './store';
import RegistrationApp from './RegistrationApp';

const RegistrationAppEntry = () => {
  const registry = init();

  return (
    <RegistryContext.Provider value={{ getRegistry: () => registry }}>
      <Provider store={registry.getStore()}>
        <RegistrationApp />
      </Provider>
    </RegistryContext.Provider>
  );
};

export default RegistrationAppEntry;
