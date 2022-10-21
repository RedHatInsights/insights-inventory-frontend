import React from 'react';
import AsyncInventory from './AsyncInventory';
import InventoryDetailCmp from '../components/InventoryDetail/FullDetail';

const BaseInventoryDetail = (props) => <AsyncInventory component={InventoryDetailCmp} {...props} />;

const InventoryDetail = React.forwardRef((props, ref) => <BaseInventoryDetail innerRef={ref} {...props} />);

export default InventoryDetail;
