import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { DesktopIcon } from '@patternfly/react-icons';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { pageContents } from '../InventoryPage';
import { AccountStatContext } from '../../Routes';
import FontAwesomeImageIcon from '../../components/FontAwesomeImageIcon';

const InventoryContentToggle = ({ changeMainContent, mainContent }) => (
  <ToggleGroup aria-label="Inventory content toggle">
    <ToggleGroupItem
      icon={<DesktopIcon />}
      aria-label="Hybrid inventory"
      isSelected={mainContent === pageContents.hybridInventory.key}
      onChange={() => changeMainContent(pageContents.hybridInventory.key)}
    />
    <ToggleGroupItem
      icon={<FontAwesomeImageIcon />}
      aria-label="Bifrost"
      isSelected={mainContent === pageContents.bifrost.key}
      onChange={() => changeMainContent(pageContents.bifrost.key)}
    />
  </ToggleGroup>
);

const InventoryPageHeader = (toggleProps) => {
  const isBifrostEnabled = useFeatureFlag('hbi.ui.bifrost');
  const { hasBootcImages } = useContext(AccountStatContext);
  return (
    <PageHeader className="pf-m-light">
      <PageHeaderTitle
        title="Systems"
        actionsContent={
          isBifrostEnabled &&
          hasBootcImages && <InventoryContentToggle {...toggleProps} />
        }
      />
    </PageHeader>
  );
};

InventoryContentToggle.propTypes = {
  changeMainContent: PropTypes.func,
  mainContent: PropTypes.string,
};
export default InventoryPageHeader;
