import React from 'react';
import AsyncInventory from './AsyncInventory';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';

const BaseIOPInventoryTable = (props) => (
  <AsyncInventory {...props} component={InventoryTableCmp} />
);
const IOPInventoryTable = React.forwardRef((props, ref) => (
  <BaseIOPInventoryTable {...props} innerRef={ref} />
));

export default IOPInventoryTable;

export { useOperatingSystemFilter } from '../components/filters/useOperatingSystemFilter';
