import { ToolbarFilter } from '@patternfly/react-core';
import React from 'react';
import { ToolbarLabel } from '@patternfly/react-core';

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
  onChange?: (event: unknown, value: TValue | undefined) => void;
  /** Controls visibility of the filter in the toolbar */
  showToolbarItem?: boolean;
  /** Controls visibility of the filter icon */
  ouiaId?: string;
  /** Custom Filter component */
  filterComponent: React.ComponentType<{
    value?: TValue | undefined;
    onChange?: (event: unknown, value: TValue | undefined) => void;
    placeholder?: string;
    filterId?: string;
  }>;
  createLabels?: (
    value: TValue | undefined,
    title: string,
  ) => (string | ToolbarLabel)[];
  deleteLabel?: (
    label: string | ToolbarLabel,
    value: TValue | undefined,
    onChange?: (event: unknown, value: TValue | undefined) => void,
  ) => void;
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
  createLabels,
  deleteLabel,
}: DataViewCustomFilterProps<TValue>) => {
  return (
    <ToolbarFilter
      key={ouiaId}
      data-ouia-component-id={ouiaId}
      labels={createLabels?.(value, title)}
      deleteLabel={(_, label) => deleteLabel?.(label, value, onChange)}
      categoryName={title}
      showToolbarItem={showToolbarItem}
    >
      <FilterComponent
        filterId={filterId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </ToolbarFilter>
  );
};

export default DataViewCustomFilter;
