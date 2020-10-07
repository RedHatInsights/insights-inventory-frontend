import React from 'react';
import { useStore, useSelector } from 'react-redux';
import GeneralInformation from '@redhat-cloud-services/frontend-components-inventory-general-info/cjs';

const GeneralInformationTab = () => {
    const writePermissions  = useSelector(
        ({ permissionsReducer: { writePermissions } }) => writePermissions
    );

    return <GeneralInformation store={useStore()} writePermissions={writePermissions} />;
};

export default GeneralInformationTab;
