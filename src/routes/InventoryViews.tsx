import React from 'react';
import { Title } from '@patternfly/react-core';
import SystemsView from '../components/SystemsView';
import { PageHeader } from '@redhat-cloud-services/frontend-components';

const InventoryViews = () => {
  return (
    <>
      <PageHeader>
        <Title headingLevel="h1">Inventory Views (Data View PoC)</Title>
      </PageHeader>
      <SystemsView />
    </>
  );
};

export default InventoryViews;
