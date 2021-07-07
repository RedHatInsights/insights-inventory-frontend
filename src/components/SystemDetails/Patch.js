import React, { useContext } from 'react';
import { RegistryContext } from '../../store';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import fallback from '../SpinnerFallback';

const PatchTab = () => {
    const { getRegistry } = useContext(RegistryContext);

    return <AsyncComponent
        appName="patch"
        module="./SystemDetail"
        getRegistry={getRegistry}
        fallback={fallback}
    />;
};

export default PatchTab;
