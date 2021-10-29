import React, { useContext } from 'react';
import { RegistryContext } from '../../store';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const PatchTab = () => {
    const { getRegistry } = useContext(RegistryContext);

    return <AsyncComponent
        appName="patch"
        module="./SystemDetail"
        getRegistry={getRegistry}
    />;
};

export default PatchTab;
