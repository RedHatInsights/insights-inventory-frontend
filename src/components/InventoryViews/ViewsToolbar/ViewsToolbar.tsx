import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import type { ViewOut } from '../../../api/inventoryViewsApi';
import { ManageViewButton } from './ManageViewButton';
import './ViewsToolbar.scss';

export interface ViewsToolbarProps {
  className?: string;
  currentViewId?: string | null;
  isSystemView?: boolean;
  viewsList?: ViewOut[];
  onSaveAs?: () => void;
}

export const ViewsToolbar = ({
  className,
  currentViewId,
  isSystemView = true,
  viewsList,
  onSaveAs,
}: ViewsToolbarProps) => {
  return (
    <Flex
      className={`ins-c-views-toolbar ${className || ''}`}
      spaceItems={{ default: 'spaceItemsMd' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      <FlexItem>
        <div>View: </div>
      </FlexItem>
      <FlexItem>
        <ManageViewButton
          currentViewId={currentViewId}
          isSystemView={isSystemView}
          onSaveAs={onSaveAs}
        />
      </FlexItem>
    </Flex>
  );
};

export default ViewsToolbar;
