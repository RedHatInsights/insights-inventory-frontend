import React from 'react';
import AsyncInventory from './AsyncInventory';
import InventoryDetailHeadComponent from '../components/InventoryDetail/InventoryDetail';

const InventoryDetailHead = (props) => <AsyncInventory {...props} component={InventoryDetailHeadComponent} />;

export default InventoryDetailHead;
