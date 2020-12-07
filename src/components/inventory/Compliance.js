import React, { lazy, Suspense } from 'react';
import '@redhat-cloud-services/frontend-components-inventory-compliance/index.css';
import { useParams } from 'react-router-dom';

const Compliance = lazy(() => import('@redhat-cloud-services/frontend-components-inventory-compliance'));

const ComplianceTab = () => <Suspense fallback="">
    <Compliance customItnl intlProps={{
        locale: navigator.language
    }} inventoryId={ useParams().inventoryId } />
</Suspense>;

export default ComplianceTab;
