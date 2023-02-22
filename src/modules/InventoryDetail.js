import React from 'react';
import AsyncInventory from './AsyncInventory';
import InventoryDetailCmp from '../components/InventoryDetail/InventoryDetail';

const BaseInventoryDetail = (props) => <AsyncInventory {...props} component={InventoryDetailCmp}  />;

const InventoryDetail = React.forwardRef((props, ref) => <BaseInventoryDetail {...props} innerRef={ref} />);

export default InventoryDetail;
