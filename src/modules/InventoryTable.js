import React from 'react';
import AsyncInventory from './AsyncInventory';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';

const BaseInventoryTable = (props) => <AsyncInventory component={InventoryTableCmp} {...props} />;

const InventoryTable = React.forwardRef((props, ref) => <BaseInventoryTable innerRef={ref} {...props} />);

export default InventoryTable;

export { useOperatingSystemFilter } from '../components/filters';
