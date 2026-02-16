import React from 'react';
import { Title } from '@patternfly/react-core';
import SystemsView from '../components/SystemsView';
import { PageHeader } from '@redhat-cloud-services/frontend-components';

interface InventoryViewsProps {
  hasAccess?: boolean;
}

const InventoryViews = (props: InventoryViewsProps) => {
  return (
    <>
      <PageHeader>
        <Title headingLevel="h1">Inventory Views (Data View PoC)</Title>
      </PageHeader>
      <SystemsView hasAccess={props.hasAccess} />
    </>
  );
};

export default InventoryViews;
