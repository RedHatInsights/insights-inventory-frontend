import React from 'react';
import ConventionalSystemsTab from '../components/InventoryTabs/ConventionalSystems/ConventionalSystemsTab';

const ForwardComponent = (props, ref) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Deprecated: HybridInventoryTabs is deprecated and will be removed in a future release. Use Inventory table directly instead.',
      );
    }
  }, []);

  return <ConventionalSystemsTab {...props} innerRef={ref} />;
};
const HybridInventoryTabsModule = React.forwardRef(ForwardComponent);

export default HybridInventoryTabsModule;
