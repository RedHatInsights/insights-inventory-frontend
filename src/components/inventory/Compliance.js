import React from 'react';
import Compliance from '@redhat-cloud-services/frontend-components-inventory-compliance';
import '@redhat-cloud-services/frontend-components-inventory-compliance/index.css';
import { IntlProvider } from 'react-intl';

const ComplianceTab = () => (
    <IntlProvider locale={navigator.language}>
        <Compliance />
    </IntlProvider>
);

export default ComplianceTab;
