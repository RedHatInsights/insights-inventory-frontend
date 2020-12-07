import React, { Suspense, lazy } from 'react';
import { useStore } from 'react-redux';

const Advisor = lazy(() => import('@redhat-cloud-services/frontend-components-inventory-insights/cjs'));

const AdvisorTab = () => {
    return <Suspense fallback="">
        <Advisor store={useStore()} />
    </Suspense>;
};

export default AdvisorTab;
