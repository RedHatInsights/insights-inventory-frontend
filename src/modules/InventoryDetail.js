import React from 'react';
import AsyncInventory from './AsyncInventory';
import InventoryDetailCmp from '../components/InventoryDetail/FullDetail';

const InventoryDetail = (props) => <AsyncInventory {...props} component={InventoryDetailCmp} />;

export default InventoryDetail;
