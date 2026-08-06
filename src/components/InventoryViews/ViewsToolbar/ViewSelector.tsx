import React, { Ref, useState } from 'react';
import {
  Divider,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import {
  ALL_SYSTEMS_VIEW_ID,
  type ViewOut,
} from '../../../api/inventoryViewsApi';

export interface ViewSelectorProps {
  views: ViewOut[];
  activeViewId: string;
  onSelectView: (viewId: string) => void;
}

const ViewSelector = ({
  views,
  activeViewId,
  onSelectView,
}: ViewSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

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
    if (value) onSelectView(value);
    setIsOpen(false);
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
      onOpenChange={(open) => setIsOpen(open)}
      toggle={toggle}
      shouldFocusToggleOnSelect
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
            {userViews.map((view) => (
              <SelectOption key={view.id} value={view.id}>
                {view.name}
              </SelectOption>
            ))}
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
