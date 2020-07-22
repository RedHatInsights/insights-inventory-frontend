import React from 'react';
import { useStore } from 'react-redux';
import GeneralInformation from '@redhat-cloud-services/frontend-components-inventory-general-info/cjs';

const GeneralInformationTab = () => {
    return <GeneralInformation store={useStore()} />;
};

export default GeneralInformationTab;
