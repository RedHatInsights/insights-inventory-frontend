import React from 'react';
import AsyncInventory from './AsyncInventory';
import DetailHeaderCmp from '../components/InventoryDetail/DetailHeader';

const BaseDetailHeader = (props) => <AsyncInventory {...props} component={DetailHeaderCmp} />;

const DetailHeader = React.forwardRef((props, ref) => <BaseDetailHeader {...props} innerRef={ref} />);

export default DetailHeader;
