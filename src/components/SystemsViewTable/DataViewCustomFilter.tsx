import { FC } from 'react';
import { ToolbarFilter } from '@patternfly/react-core';
import React from 'react';
import { ToolbarLabel } from '@patternfly/react-core';

export interface DataViewCustomFilterProps {
  /** Unique key for the filter attribute */
  filterId: string;
  /** Array of current filter values */
  value?: string[];
  /** Filter title displayed in the toolbar */
  title: string;
  /** Placeholder text of the menu */
  placeholder?: string;
  /** Callback for updating when item selection changes. */
  onChange?: (event: unknown, value: string[]) => void;
  /** Controls visibility of the filter in the toolbar */
  showToolbarItem?: boolean;
  /** Controls visibility of the filter icon */
  ouiaId?: string;
  /** Custom Filter component */
  filterComponent: React.ComponentType<{
    value: string[];
    onChange?: (event: unknown, value: string[]) => void;
    placeholder?: string;
    filterId?: string;
  }>;
}

const isToolbarLabel = (label: string | ToolbarLabel): label is ToolbarLabel =>
  typeof label === 'object' && 'key' in label;

export const DataViewCustomFilter: FC<DataViewCustomFilterProps> = ({
  filterId,
  title,
  value = [],
  onChange,
  placeholder,
  showToolbarItem,
  ouiaId = 'DataViewCustomFilter',
  filterComponent: FilterComponent,
}: DataViewCustomFilterProps) => {
  return (
    <ToolbarFilter
      key={ouiaId}
      data-ouia-component-id={ouiaId}
      labels={value.map((item) => {
        return {
          key: title,
          node: item,
        };
      })}
      deleteLabel={(_, label) =>
        onChange?.(
          undefined,
          value.filter(
            (item) => item !== (isToolbarLabel(label) ? label.node : label),
          ),
        )
      }
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
