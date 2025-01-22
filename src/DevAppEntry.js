import React from 'react';
import logger from 'redux-logger'

import AppEntry from './AppEntry';

const InventoryApp = () => <AppEntry logger={logger} />;

export default InventoryApp;
