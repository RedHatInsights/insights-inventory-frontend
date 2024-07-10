import React, { useState } from 'react';
import './inventory.scss';
import InventoryPageHeader from './InventoryComponents/InventoryPageHeader';
import { PageSection } from '@patternfly/react-core';
import { pageContents } from './InventoryComponents/InventoryPageContents';

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
