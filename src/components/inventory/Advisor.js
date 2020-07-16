import React from 'react';
import { useStore } from 'react-redux';
import Advisor from '@redhat-cloud-services/frontend-components-inventory-insights/cjs';

const AdvisorTab = () => {
    return <Advisor store={useStore()} />;
};

export default AdvisorTab;
