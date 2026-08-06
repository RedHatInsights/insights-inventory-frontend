import React from 'react';
import {
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
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
    <PageSection
      className={css('ins-c-views-toolbar', className)}
      hasBodyWrapper={false}
    >
      <Toolbar ouiaId="views-toolbar">
        <ToolbarContent>
          <ToolbarItem variant="label" alignSelf="center">
            View:
          </ToolbarItem>
          <ToolbarItem>
            <ViewSelector
              views={viewsList}
              activeViewId={activeViewId}
              onSelectView={onSelectView}
            />
          </ToolbarItem>
          <ToolbarItem>
            <ManageViewButton
              currentViewId={currentViewId}
              isSystemView={isSystemView}
              onSaveAs={onSaveAs}
              onRename={onRename}
              onDelete={onDelete}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};

export default ViewsToolbar;
