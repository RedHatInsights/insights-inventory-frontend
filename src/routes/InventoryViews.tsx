import React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import SystemsViewTable from '../components/SystemsViewTable';
import { PageHeader } from '@redhat-cloud-services/frontend-components';

const InventoryViews: React.FC = () => {
  return (
    <>
      <PageHeader>
        <Title headingLevel="h1">Inventory Views (Data View PoC)</Title>
      </PageHeader>
      <SystemsViewTable />
    </>
  );
};

export default InventoryViews;
