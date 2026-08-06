import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import type { ViewOut } from '../../../api/inventoryViewsApi';
import { ManageViewButton } from './ManageViewButton';
import ViewSelector from './ViewSelector';
import './ViewsToolbar.scss';

export interface ViewsToolbarProps {
  className?: string;
  activeViewId: string;
  currentViewId?: string | null;
  isSystemView?: boolean;
  viewsList?: ViewOut[];
  onSelectView: (viewId: string) => void;
  onSaveAs: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const ViewsToolbar = ({
  className,
  activeViewId,
  currentViewId,
  isSystemView = true,
  viewsList = [],
  onSelectView,
  onSaveAs,
  onRename,
  onDelete,
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
        <ViewSelector
          views={viewsList}
          activeViewId={activeViewId}
          onSelectView={onSelectView}
        />
      </FlexItem>
      <FlexItem>
        <ManageViewButton
          currentViewId={currentViewId}
          isSystemView={isSystemView}
          onSaveAs={onSaveAs}
          onRename={onRename}
          onDelete={onDelete}
        />
      </FlexItem>
    </Flex>
  );
};

export default ViewsToolbar;
