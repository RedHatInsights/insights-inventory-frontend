import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useKesselMigrationFeatureFlag } from '../Utilities/hooks/useKesselMigrationFeatureFlag';

const KesselMigrationContext = createContext(false);

export const KesselMigrationProvider = ({ children }) => {
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();

  return (
    <KesselMigrationContext.Provider value={isKesselMigrationEnabled}>
      {children}
    </KesselMigrationContext.Provider>
  );
};

KesselMigrationProvider.propTypes = {
  children: PropTypes.node,
};

export const useKesselMigration = () => {
  return useContext(KesselMigrationContext);
};
