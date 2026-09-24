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
  defaultViewId?: string;
  currentViewId?: string | null;
  isSystemView?: boolean;
  isViewDirty?: boolean;
  isSaving?: boolean;
  isOwner?: boolean;
  isDefaultView?: boolean;
  isSettingDefault?: boolean;
  viewsList?: ViewOut[];
  onSelectView: (viewId: string) => void;
  onSaveAs: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  onFetchNextViewsPage?: () => Promise<unknown>;
  hasNextViewsPage?: boolean;
  isFetchingNextViewsPage?: boolean;
  onSave?: () => void;
}

export const ViewsToolbar = ({
  className,
  activeViewId,
  defaultViewId,
  currentViewId,
  isSystemView = true,
  isViewDirty = false,
  isSaving = false,
  isOwner = false,
  isDefaultView = false,
  isSettingDefault = false,
  viewsList = [],
  onSelectView,
  onSaveAs,
  onRename,
  onDelete,
  onSetDefault,
  onFetchNextViewsPage,
  hasNextViewsPage,
  isFetchingNextViewsPage,
  onSave,
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
              defaultViewId={defaultViewId}
              onSelectView={onSelectView}
              onFetchNextPage={onFetchNextViewsPage}
              hasNextPage={hasNextViewsPage}
              isFetchingNextPage={isFetchingNextViewsPage}
            />
          </ToolbarItem>
          <ToolbarItem>
            <ManageViewButton
              currentViewId={currentViewId}
              isSystemView={isSystemView}
              isViewDirty={isViewDirty}
              isSaving={isSaving}
              isOwner={isOwner}
              isDefaultView={isDefaultView}
              isSettingDefault={isSettingDefault}
              onSaveAs={onSaveAs}
              onRename={onRename}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
              onSave={onSave}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};

export default ViewsToolbar;
