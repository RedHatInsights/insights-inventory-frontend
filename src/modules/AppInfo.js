import React from 'react';
import AsyncInventory from './AsyncInventory';
import { AppInfo as AppInfoCmp } from '../components/InventoryDetail';

const BaseAppInfo = (props) => <AsyncInventory component={AppInfoCmp} {...props} />;

const AppInfo = React.forwardRef((props, ref) => <BaseAppInfo innerRef={ref} {...props} />);

export default AppInfo;
