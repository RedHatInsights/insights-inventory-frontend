import React from 'react';
import AsyncInventory from './AsyncInventory';
import { AppInfo as AppInfoCmp } from '../components/InventoryDetail';

const AppInfo = (props) => <AsyncInventory {...props} component={AppInfoCmp} />;

export default AppInfo;
