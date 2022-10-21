import React from 'react';
import AsyncInventory from './AsyncInventory';
import DetailWrapperCmp from '../components/InventoryDetail/DetailRenderer';

const BaseDetailWrapper = (props) => <AsyncInventory component={DetailWrapperCmp} {...props} />;

const DetailWrapper = React.forwardRef((props, ref) => <BaseDetailWrapper innerRef={ref} {...props} />);

export default DetailWrapper;
