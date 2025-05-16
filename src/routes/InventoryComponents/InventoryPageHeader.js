import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  FlexItem,
  Alert,
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
import FontAwesomeImageIcon from '../../components/FontAwesomeImageIcon';
import { AccountStatContext } from '../../Contexts';
import { pageContents } from './InventoryPageContents';
import { InventoryPopover } from './InventoryPopover';

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
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Alert
            variant="info"
            isInline
            title={<>Upcoming decommission of hosted edge management service</>}
            className="pf-v5-u-mt-sm pf-v5-u-mb-sm"
          >
            <TextContent>
              <Text>
                As of July 31, 2025, the hosted edge management service
                supported. Consequently, pushing image updates to Immutable
                Immutable (OSTree) systems via the Hybrid Cloud Console using
                Console using this service will be discontinued. Customers are
                are encouraged to explore Red Hat Edge Manager (RHEM) as the
                recommended alternative for managing their edge systems.
              </Text>
            </TextContent>
          </Alert>
        </FlexItem>

        <FlexItem>
          <PageHeaderTitle
            title={
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                <div>Systems</div>
                <InventoryPopover />
              </Flex>
            }
            actionsContent={
              isBifrostEnabled &&
              hasBootcImages && <InventoryContentToggle {...toggleProps} />
            }
          />
        </FlexItem>
      </Flex>
    </PageHeader>
  );
};

InventoryContentToggle.propTypes = {
  changeMainContent: PropTypes.func,
  mainContent: PropTypes.string,
};

export default InventoryPageHeader;
