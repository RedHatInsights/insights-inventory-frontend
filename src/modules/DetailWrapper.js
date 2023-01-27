import React from 'react';
import AsyncInventory from './AsyncInventory';
import DetailWrapperCmp from '../components/InventoryDetail/DetailRenderer';

const BaseDetailWrapper = (props) => <AsyncInventory {...props} component={DetailWrapperCmp}  />;

const DetailWrapper = React.forwardRef((props, ref) => <BaseDetailWrapper {...props} innerRef={ref} />);

export default DetailWrapper;
