import React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import SystemsDataViewTable from '../components/SystemsViewTable';

const InventoryViews = function InventoryViews() {
  return (
    <>
      <PageSection>
        <Title headingLevel="h1">Inventory Views (Data View POC)</Title>
      </PageSection>
      <PageSection>
        <SystemsDataViewTable />
      </PageSection>
    </>
  );
};

export default InventoryViews;
