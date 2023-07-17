import React, { useEffect } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

const Groups = () => {
  const chrome = useChrome();

  useEffect(() => {
    chrome?.updateDocumentTitle?.('Inventory Groups | Red Hat Insights');
  }, [chrome]);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title="Groups" />
      </PageHeader>
      <InventoryGroups />
    </React.Fragment>
  );
};

export default Groups;
