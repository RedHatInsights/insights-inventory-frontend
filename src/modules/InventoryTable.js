import React from 'react';
import AsyncInventory from './AsyncInventory';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';

const BaseInventoryTable = (props) => (
  <AsyncInventory {...props} component={InventoryTableCmp} />
);
console.log('hello I am inventroy')
const InventoryTable = React.forwardRef((props, ref) => (
  <BaseInventoryTable {...props} innerRef={ref} />
));

export default InventoryTable;

export { default as useOperatingSystemFilter } from '../components/filters/useOperatingSystemFilter';
