import React from 'react';
import {
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';
import { DesktopIcon } from '@patternfly/react-icons';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import { View } from '../../routes/InventoryViews';

interface SystemsViewToggleProps {
  view: View;
  setView: React.Dispatch<React.SetStateAction<View>>;
}

export const SystemsViewToggle = ({
  view,
  setView,
}: SystemsViewToggleProps) => (
  <Flex spaceItems={{ default: 'spaceItemsMd' }}>
    <FlexItem>
      <Content>
        <Content component={ContentVariants.h4}>View by</Content>
      </Content>
    </FlexItem>
    <FlexItem>
      <ToggleGroup aria-label="Inventory content toggle">
        <Tooltip
          content="View by systems"
          triggerRef={() => document.getElementById('view-by-systems-toggle')!}
        />
        <ToggleGroupItem
          id="view-by-systems-toggle"
          icon={<DesktopIcon />}
          aria-label="View by systems"
          isSelected={view === 'systems'}
          onChange={() => setView('systems')}
        />
        <Tooltip
          content="View by images"
          triggerRef={() => document.getElementById('view-by-images-toggle')!}
        />
        <ToggleGroupItem
          id="view-by-images-toggle"
          icon={<FontAwesomeImageIcon />}
          aria-label="View by images"
          isSelected={view === 'images'}
          onChange={() => setView('images')}
        />
      </ToggleGroup>
    </FlexItem>
  </Flex>
);

export default SystemsViewToggle;
