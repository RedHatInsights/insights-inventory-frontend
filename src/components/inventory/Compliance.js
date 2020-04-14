import React from 'react';
import Compliance from '@redhat-cloud-services/frontend-components-inventory-compliance';
import '@redhat-cloud-services/frontend-components-inventory-compliance/index.css';
import { IntlProvider } from 'react-intl';
import { useParams } from 'react-router-dom';

const ComplianceTab = () => (
    <IntlProvider locale={navigator.language}>
        <Compliance inventoryId={ useParams().inventoryId }/>
    </IntlProvider>
);

export default ComplianceTab;
