import React from 'react';
import { useStore } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const ComplianceTab = () => {
    const { params } = useRouteMatch('/:inventoryId');
    return <AsyncComponent
        appName="compliance"
        module="./SystemDetail"
        store={useStore()}
        customItnl
        intlProps={{
            locale: navigator.language.slice(0, 2)
        }}
        inventoryId={ params.inventoryId }
        remediationsEnabled
    />;
};

export default ComplianceTab;
