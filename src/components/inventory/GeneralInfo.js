import React, { Suspense, lazy } from 'react';
import { useStore, useSelector } from 'react-redux';

const GeneralInformation = lazy(
    () => import('@redhat-cloud-services/frontend-components-inventory-general-info/esm/GeneralInformation')
);

const GeneralInformationTab = () => {
    const writePermissions = useSelector(
        ({ permissionsReducer }) => permissionsReducer?.writePermissions
    );

    return <Suspense fallback="">
        <GeneralInformation store={useStore()} writePermissions={writePermissions} />
    </Suspense>;
};

export default GeneralInformationTab;
