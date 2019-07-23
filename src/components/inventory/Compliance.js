import React from 'react';
import Compliance from '@redhat-cloud-services/frontend-components-inventory-compliance';
import { IntlProvider } from 'react-intl';

const ComplianceTab = () => (
    <IntlProvider locale={navigator.language}>
        <Compliance />
    </IntlProvider>
);

export default ComplianceTab;
