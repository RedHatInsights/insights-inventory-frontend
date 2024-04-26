import React, { useContext, useRef } from 'react';
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

const InventoryContentToggle = ({ changeMainContent, mainContent }) => {
  const viewBySystemsToggle = useRef(null);
  const viewByImagesToggle = useRef(null);

  return (
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
            position="top-end"
            triggerRef={viewBySystemsToggle}
          >
            <ToggleGroupItem
              ref={viewBySystemsToggle}
              icon={<DesktopIcon />}
              aria-label="Hybrid inventory"
              isSelected={mainContent === pageContents.hybridInventory.key}
              onChange={() =>
                changeMainContent(pageContents.hybridInventory.key)
              }
            />
          </Tooltip>
          <Tooltip
            content="View by images"
            position="top-end"
            triggerRef={viewByImagesToggle}
          >
            <ToggleGroupItem
              ref={viewByImagesToggle}
              icon={<FontAwesomeImageIcon />}
              aria-label="Bifrost"
              isSelected={mainContent === pageContents.bifrost.key}
              onChange={() => changeMainContent(pageContents.bifrost.key)}
            />
          </Tooltip>
        </ToggleGroup>
      </SplitItem>
    </Split>
  );
};

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
