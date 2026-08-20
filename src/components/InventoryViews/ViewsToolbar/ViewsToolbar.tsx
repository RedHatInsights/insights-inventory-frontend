import React from 'react';
import {
  Button,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
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
  isViewDirty?: boolean;
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
  isViewDirty = false,
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
          <ToolbarItem
            variant="label"
            alignSelf="center"
            gap={{ default: 'gapNone' }}
          >
            View
            <Tooltip content="Select a Systems View">
              <Button
                variant="plain"
                icon={<OutlinedQuestionCircleIcon />}
                aria-label="View"
              />
            </Tooltip>
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
              isViewDirty={isViewDirty}
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
