import React from 'react';
import Compliance from '@redhat-cloud-services/frontend-components-inventory-compliance';
import '@redhat-cloud-services/frontend-components-inventory-compliance/index.css';
import { useParams } from 'react-router-dom';

const ComplianceTab = () => (
    <Compliance customItnl inventoryId={ useParams().inventoryId } intlProps={ {
        locale: navigator.language
    } }/>
);

export default ComplianceTab;
