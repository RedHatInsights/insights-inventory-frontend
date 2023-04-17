import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryRoutes } from './Routes';
import './App.scss';
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications/';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const App = () => {
    const navigate = useNavigate();
    const chrome = useChrome();
    useEffect(() => {
        return chrome.on(
            'APP_NAVIGATION',
            event => {
                if (event.navId === 'inventory') {
                    navigate(`/${location.search}${location.hash}`);
                } else {
                    navigate(`/${event.navId}${location.search}${location.hash}`);
                }
            }
        );
    }, []);

    return (
        <div className="inventory">
            <NotificationsPortal />
            <RBACProvider appName="inventory">
                <InventoryRoutes />
            </RBACProvider>
        </div>
    );
};

export default App;
