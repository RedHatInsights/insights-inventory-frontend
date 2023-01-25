import React from 'react';
import AsyncInventory from './AsyncInventory';
import DetailWrapperCmp from '../components/InventoryDetail/DetailRenderer';

const DetailWrapper = (props) => <AsyncInventory {...props} component={DetailWrapperCmp} />;

export default DetailWrapper;
