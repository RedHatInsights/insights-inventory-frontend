import React from 'react';
import AsyncInventory from './AsyncInventory';
import InventoryDetailHeadComponent from '../components/InventoryDetail/InventoryDetail';

const BaseInventoryDetailHead = (props) => <AsyncInventory {...props} component={InventoryDetailHeadComponent}  />;

const InventoryDetailHead = React.forwardRef((props, ref) => <BaseInventoryDetailHead {...props} innerRef={ref} />);

export default InventoryDetailHead;
