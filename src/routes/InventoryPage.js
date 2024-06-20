import React, { useState } from 'react';
import './inventory.scss';
import HybridInventory from './InventoryComponents/HybridInventory';
import InventoryPageHeader from './InventoryComponents/InventoryPageHeader';
import BifrostPage from './InventoryComponents/BifrostPage';
import { PageSection } from '@patternfly/react-core';

export const pageContents = {
  hybridInventory: {
    key: 'hybridInventory',
    component: HybridInventory,
  },
  bifrost: {
    key: 'bifrost',
    component: BifrostPage,
  },
};

const Inventory = (props) => {
  const [mainContent, setMainContent] = useState(
    pageContents.hybridInventory.key
  );

  return (
    <React.Fragment>
      <InventoryPageHeader
        mainContent={mainContent}
        changeMainContent={setMainContent}
      />
      <PageSection>
        {React.createElement(pageContents[mainContent].component, { ...props })}
      </PageSection>
    </React.Fragment>
  );
};

export default Inventory;
