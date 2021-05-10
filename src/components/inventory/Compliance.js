import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import fallback from '../SpinnerFallback';

const ComplianceTab = () => {
    const { params } = useRouteMatch('/:inventoryId');

    return <AsyncComponent
        appName="compliance"
        module="./SystemDetail"
        fallback={fallback}
        inventoryId={ params.inventoryId }
        customItnl
        intlProps={{
            locale: navigator.language
        }}
    />;
};

export default ComplianceTab;
