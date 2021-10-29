import React from 'react';
import { useStore } from 'react-redux';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const AdvisorTab = () => {
    return <AsyncComponent
        appName="advisor"
        module="./SystemDetail"
        store={useStore()}
        customItnl
        intlProps={{
            locale: navigator.language
        }}
    />;
};

export default AdvisorTab;
