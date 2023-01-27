import React from 'react';
import AsyncInventory from './AsyncInventory';
import { AppInfo as AppInfoCmp } from '../components/InventoryDetail';

const BaseAppInfo = (props) => <AsyncInventory {...props} component={AppInfoCmp}  />;

const AppInfo = React.forwardRef((props, ref) => <BaseAppInfo {...props} innerRef={ref} />);

export default AppInfo;
