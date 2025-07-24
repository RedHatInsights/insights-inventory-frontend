import React from 'react';
import AsyncInventory from './AsyncInventory';
import { IOPInventoryTable as InventoryTableCmp } from '../components/InventoryTable/IOPInventoryTable';

const BaseIOPInventoryTable = (props) => (
  <AsyncInventory {...props} component={InventoryTableCmp} />
);
const IOPInventoryTableModule = React.forwardRef((props, ref) => (
  <BaseIOPInventoryTable {...props} innerRef={ref} />
));

export default IOPInventoryTableModule;

export { useOperatingSystemFilter } from '../components/filters/useOperatingSystemFilter';
