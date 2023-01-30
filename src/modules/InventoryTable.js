import React from 'react';
import AsyncInventory from './AsyncInventory';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';

const BaseInventoryTable = (props) => <AsyncInventory {...props} component={InventoryTableCmp}  />;

const InventoryTable = React.forwardRef((props, ref) => <BaseInventoryTable {...props} innerRef={ref} />);

export default InventoryTable;

export { useOperatingSystemFilter } from '../components/filters';
