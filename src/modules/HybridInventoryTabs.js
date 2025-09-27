import React from 'react';
import PropTypes from 'prop-types';

const HybridInventoryTabsModule = ({ ConventionalSystemsTab }) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Deprecated: HybridInventoryTabs is deprecated and will be removed in a future release. Use Inventory table directly instead.',
      );
    }
  }, []);

  return ConventionalSystemsTab;
};

HybridInventoryTabsModule.propTypes = {
  ConventionalSystemsTab: PropTypes.element.isRequired,
};

export default HybridInventoryTabsModule;
