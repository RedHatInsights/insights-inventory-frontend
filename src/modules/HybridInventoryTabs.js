import React from 'react';
import HybridInventoryTabs from '../components/InventoryTabs/HybridInventoryTabs';

const ForwardComponent = (props, ref) => (
  <HybridInventoryTabs {...props} innerRef={ref} />
);
const HybridInventoryTabsModule = React.forwardRef(ForwardComponent);

export default HybridInventoryTabsModule;
