import React, { useContext, useEffect } from 'react';
import { RegistryContext } from './store';
import { useHistory } from 'react-router-dom';
import { Routes } from './Routes';
import './App.scss';
import { INVENTORY_ROOT } from './config';
import { reducers } from './store';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import PermissionLoader from './components/PermissionsLoader';

const App = () => {
    const { getRegistry } = useContext(RegistryContext);
    const history = useHistory();
    useEffect(() => {
        getRegistry().register(reducers);
        insights.chrome.init();
        insights.chrome.identifyApp(INVENTORY_ROOT);
        return insights.chrome.on(
            'APP_NAVIGATION',
            event => history.push(`/${event.navId}${location.search}${location.hash}`)
        );
    }, []);

    return (
        <div className="inventory">
            <NotificationsPortal />
            <PermissionLoader />
            <Routes />
        </div>
    );
};

export default App;
