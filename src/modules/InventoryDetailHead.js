import React from 'react';
import AsyncInventory from './AsyncInventory';
import InventoryDetailHeadComponent from '../components/InventoryDetail/InventoryDetail';

const BaseInventoryDetailHead = (props) => <AsyncInventory component={InventoryDetailHeadComponent} {...props} />;

const InventoryDetailHead = React.forwardRef((props, ref) => <BaseInventoryDetailHead innerRef={ref} {...props} />);

export default InventoryDetailHead;
