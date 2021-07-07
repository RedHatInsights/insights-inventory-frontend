import React, { lazy, Suspense } from 'react';
import { useRouteMatch } from 'react-router-dom';

const Compliance = lazy(() => import('@redhat-cloud-services/frontend-components-inventory-compliance/Compliance'));

const ComplianceTab = () => {
    const { params } = useRouteMatch('/:inventoryId');

    return (
        <Suspense fallback="">
            <Compliance customItnl intlProps={{
                locale: navigator.language
            }} inventoryId={ params.inventoryId } />
        </Suspense>
    );
};

export default ComplianceTab;
