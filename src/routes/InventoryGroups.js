import React, { useEffect } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const Groups = () => {
    const chrome = useChrome();

    useEffect(() => {
        chrome?.updateDocumentTitle?.('Inventory Groups | Red Hat Insights');
    }, [chrome]);

    return <InventoryGroups />;
};

export default Groups;
