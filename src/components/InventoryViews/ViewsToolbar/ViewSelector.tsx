import React, { Ref, useState } from 'react';
import {
  Divider,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import {
  ALL_SYSTEMS_VIEW_ID,
  type ViewOut,
} from '../../../api/inventoryViewsApi';
import { DEFAULT_PAGE_SIZE } from '../hooks/useViewsQuery';

export interface ViewSelectorProps {
  views: ViewOut[];
  activeViewId: string;
  onSelectView: (viewId: string) => void;
  onFetchNextPage?: () => Promise<unknown>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const PAGE_SIZE = DEFAULT_PAGE_SIZE;
const LOADER_ID = '__view-selector-show-more__';

const ViewSelector = ({
  views,
  activeViewId,
  onSelectView,
  onFetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ViewSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleSize, setVisibleSize] = useState(PAGE_SIZE);

  const activeView = views.find((v) => v.id === activeViewId);
  const toggleLabel = activeView?.name ?? 'All systems';

  const { allSystemsView, userViews, systemViews } = views.reduce<{
    allSystemsView: ViewOut | undefined;
    userViews: ViewOut[];
    systemViews: ViewOut[];
  }>(
    (acc, view) => {
      if (view.id === ALL_SYSTEMS_VIEW_ID) {
        acc.allSystemsView = view;
      } else if (view.is_system_view) {
        acc.systemViews.push(view);
      } else {
        acc.userViews.push(view);
      }
      return acc;
    },
    { allSystemsView: undefined, userViews: [], systemViews: [] },
  );

  const onToggleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const onSelect = (_event: unknown, value: string | undefined) => {
    if (!value || value === LOADER_ID) return;
    onSelectView(value);
    setIsOpen(false);
  };

  const visibleUserViews = userViews.slice(0, visibleSize);
  const canShowMore =
    userViews.length > visibleSize || !!(hasNextPage && onFetchNextPage);

  const onShowMoreClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const nextVisibleSize = visibleSize + PAGE_SIZE;
    if (nextVisibleSize > userViews.length && hasNextPage && onFetchNextPage) {
      await onFetchNextPage();
    }
    setVisibleSize(nextVisibleSize);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      aria-label="Select a view"
    >
      {toggleLabel}
    </MenuToggle>
  );

  return (
    <Select
      isOpen={isOpen}
      selected={activeViewId}
      onSelect={onSelect}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setVisibleSize(PAGE_SIZE);
      }}
      toggle={toggle}
      shouldFocusToggleOnSelect
      isScrollable
    >
      <SelectList>
        {allSystemsView && (
          <SelectOption key={allSystemsView.id} value={allSystemsView.id}>
            {allSystemsView.name}
          </SelectOption>
        )}
        {userViews.length > 0 && (
          <>
            <Divider />
            {visibleUserViews.map((view) => (
              <SelectOption key={view.id} value={view.id}>
                {view.name}
              </SelectOption>
            ))}
            {canShowMore && (
              <SelectOption
                value={LOADER_ID}
                isLoadButton={!isFetchingNextPage}
                isLoading={isFetchingNextPage}
                isDisabled={isFetchingNextPage}
                style={{ overflow: 'visible' }}
                onClick={onShowMoreClick}
              >
                {isFetchingNextPage ? <Spinner size="lg" /> : 'Show more'}
              </SelectOption>
            )}
          </>
        )}
        {systemViews.length > 0 && (
          <>
            <Divider />
            {systemViews.map((view) => (
              <SelectOption
                key={view.id}
                value={view.id}
                description={
                  <Label isCompact color="blue">
                    System
                  </Label>
                }
              >
                {view.name}
              </SelectOption>
            ))}
          </>
        )}
      </SelectList>
    </Select>
  );
};

export default ViewSelector;
