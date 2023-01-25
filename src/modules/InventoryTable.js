import React from 'react';
import AsyncInventory from './AsyncInventory';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';

const InventoryTable = (props) => <AsyncInventory {...props} component={InventoryTableCmp}  />;

export default InventoryTable;

export { useOperatingSystemFilter } from '../components/filters';
