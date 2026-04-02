import {
  ToolbarFilter,
  ToolbarLabel,
  ToolbarLabelGroup,
} from '@patternfly/react-core';
import React from 'react';
import MultiGroupToolbarFilter from './MultiGroupToolbarFilter';

type SingleGroupLabels = (string | ToolbarLabel)[];
type MultiGroupLabels = {
  category: string | ToolbarLabelGroup;
  labels: (string | ToolbarLabel)[];
}[];

export interface DataViewCustomFilterProps<TValue> {
  /** Unique key for the filter attribute */
  filterId: string;
  /** Current filter values */
  value?: TValue;
  /** Filter title displayed in the toolbar */
  title: string;
  /** Placeholder text of the menu */
  placeholder?: string;
  /** Callback for updating when item selection changes. */
  onChange?: (event?: React.MouseEvent, values?: TValue) => void;
  /** Controls visibility of the filter in the toolbar */
  showToolbarItem?: boolean;
  /** Controls visibility of the filter icon */
  ouiaId?: string;
  /** Custom Filter component */
  filterComponent: React.ComponentType<{
    value?: TValue;
    onChange?: (event?: React.MouseEvent, values?: TValue) => void;
    placeholder?: string;
    filterId?: string;
  }>;
  createLabel: (
    value: TValue | undefined,
    title: string,
  ) => SingleGroupLabels | MultiGroupLabels;

  deleteLabel?: (
    category: string | ToolbarLabelGroup,
    label: string | ToolbarLabel,
    value: TValue | undefined,
    onChange?: (event?: React.MouseEvent, values?: TValue) => void,
  ) => void;
  isMultiGroup?: boolean;
}

export const DataViewCustomFilter = <TValue,>({
  filterId,
  title,
  value,
  onChange,
  placeholder,
  showToolbarItem,
  ouiaId = 'DataViewCustomFilter',
  filterComponent: FilterComponent,
  createLabel,
  deleteLabel,
  isMultiGroup = false,
}: DataViewCustomFilterProps<TValue>) => {
  const filter = (
    <FilterComponent
      filterId={filterId}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );

  return isMultiGroup ? (
    <MultiGroupToolbarFilter
      key={ouiaId}
      data-ouia-component-id={ouiaId}
      groupLabels={createLabel?.(value, title) as MultiGroupLabels}
      deleteLabel={(category, label) =>
        deleteLabel?.(category, label, value, onChange)
      }
      showToolbarItem={showToolbarItem}
      categoryName={title}
    >
      {filter}
    </MultiGroupToolbarFilter>
  ) : (
    <ToolbarFilter
      key={ouiaId}
      data-ouia-component-id={ouiaId}
      labels={createLabel?.(value, title) as SingleGroupLabels}
      deleteLabel={(category, label) =>
        deleteLabel?.(category, label, value, onChange)
      }
      categoryName={title}
      showToolbarItem={showToolbarItem}
    >
      {filter}
    </ToolbarFilter>
  );
};

export default DataViewCustomFilter;
