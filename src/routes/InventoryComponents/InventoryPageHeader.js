import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Split,
  SplitItem,
  ToggleGroup,
  ToggleGroupItem,
  Text,
  TextContent,
  TextVariants,
  Tooltip,
} from '@patternfly/react-core';
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
  <Split hasGutter>
    <SplitItem>
      <TextContent>
        <Text style={{ paddingTop: '5px' }} component={TextVariants.h4}>
          View by
        </Text>
      </TextContent>
    </SplitItem>
    <SplitItem>
      <ToggleGroup aria-label="Inventory content toggle">
        <Tooltip
          content="View by systems"
          triggerRef={() => document.getElementById('view-by-systems-toggle')}
        />
        <ToggleGroupItem
          id="view-by-systems-toggle"
          icon={<DesktopIcon />}
          aria-label="View by systems"
          isSelected={mainContent === pageContents.hybridInventory.key}
          onChange={() => changeMainContent(pageContents.hybridInventory.key)}
        />
        <Tooltip
          content="View by images"
          triggerRef={() => document.getElementById('view-by-images-toggle')}
        />
        <ToggleGroupItem
          id="view-by-images-toggle"
          icon={<FontAwesomeImageIcon />}
          aria-label="View by images"
          isSelected={mainContent === pageContents.bifrost.key}
          onChange={() => changeMainContent(pageContents.bifrost.key)}
        />
      </ToggleGroup>
    </SplitItem>
  </Split>
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
