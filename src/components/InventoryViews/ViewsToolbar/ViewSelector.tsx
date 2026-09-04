import React, { Ref, useState, useMemo } from 'react';
import {
  Divider,
  Label,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import type { ViewOut } from '../../../api/inventoryViewsApi';
import { DEFAULT_PAGE_SIZE } from '../hooks/useViewsQuery';
import { TypeaheadMenuToggle } from '../../SystemsView/filters/TypeaheadMenuToggle';
import { useDebouncedValue } from '../../../Utilities/hooks/useDebouncedValue';
import { DEBOUNCE_TIMEOUT_MS } from '../../../constants';

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
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_TIMEOUT_MS);

  const activeView = views.find((v) => v.id === activeViewId);
  const toggleLabel = activeView?.name ?? 'All systems';

  // Group and filter views based on search
  const { allSystemsView, userViews, systemViews } = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();

    return views.reduce<{
      allSystemsView: ViewOut | undefined;
      userViews: ViewOut[];
      systemViews: ViewOut[];
    }>(
      (acc, view) => {
        // Filter by search term
        const matchesSearch =
          !searchLower || view.name.toLowerCase().includes(searchLower);

        if (!matchesSearch) {
          return acc;
        }

        if (view.is_system_view) {
          if (!acc.allSystemsView) {
            acc.allSystemsView = view;
          } else {
            acc.systemViews.push(view);
          }
        } else {
          acc.userViews.push(view);
        }
        return acc;
      },
      { allSystemsView: undefined, userViews: [], systemViews: [] },
    );
  }, [views, debouncedSearch]);

  const onToggleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSearch('');
    }
  };

  const onSelect = (_event: unknown, value: string | undefined) => {
    if (!value || value === LOADER_ID) return;
    onSelectView(value);
    setIsOpen(false);
    setSearch('');
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
    <TypeaheadMenuToggle
      toggleRef={toggleRef}
      isExpanded={isOpen}
      onToggleClick={onToggleClick}
      searchValue={search}
      onSearchChange={setSearch}
      placeholder={toggleLabel}
      inputId="view-selector-typeahead-input"
    />
  );

  return (
    <Select
      isOpen={isOpen}
      selected={activeViewId}
      onSelect={onSelect}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setVisibleSize(PAGE_SIZE);
          setSearch('');
        }
      }}
      toggle={toggle}
      data-testid="manage-view-select-view-dropdown"
      shouldFocusToggleOnSelect
      isScrollable
    >
      <SelectList>
        {!allSystemsView &&
          userViews.length === 0 &&
          systemViews.length === 0 &&
          debouncedSearch && (
            <SelectOption isDisabled>No matching views</SelectOption>
          )}
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
          </>
        )}
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
