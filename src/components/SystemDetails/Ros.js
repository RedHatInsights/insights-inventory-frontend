import React, { useContext } from 'react';
import { useRouteMatch } from 'react-router-dom';
import RegistryContext from '../../store/registeryContext';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const RosTab = () => {
    const { params } = useRouteMatch('/:inventoryId');
    const { getRegistry } = useContext(RegistryContext);

    return <AsyncComponent
        appName="ros"
        module="./SystemDetail"
        getRegistry={getRegistry}
        inventoryId={params.inventoryId}
    />;
};

export default RosTab;
