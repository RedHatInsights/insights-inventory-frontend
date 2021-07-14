import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Routes } from './Routes';
import './App.scss';
import { INVENTORY_ROOT } from './config';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import PermissionLoader from './components/PermissionsLoader';

const App = () => {
    const history = useHistory();
    useEffect(() => {
        insights.chrome.init();
        insights.chrome.identifyApp(INVENTORY_ROOT);
        return insights.chrome.on(
            'APP_NAVIGATION',
            event => {
                if (event.navId === 'inventory') {
                    history.push(`/${location.search}${location.hash}`);
                } else {
                    history.push(`/${event.navId}${location.search}${location.hash}`);
                }
            }
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
