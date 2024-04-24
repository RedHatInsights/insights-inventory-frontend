import React, { useState } from 'react';
import './inventory.scss';
import Main from '@redhat-cloud-services/frontend-components/Main';
import HybridInventory from './InventoryComponents/HybridInventory';
import InventoryPageHeader from './InventoryComponents/InventoryPageHeader';
import BifrostPage from './InventoryComponents/BifrostPage';

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
      <Main>
        {React.createElement(pageContents[mainContent].component, { ...props })}
      </Main>
    </React.Fragment>
  );
};

export default Inventory;
