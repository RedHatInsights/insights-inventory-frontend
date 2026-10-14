import React, { type FC, type MouseEvent as ReactMouseEvent } from 'react';
import {
  DataViewSelectFilter,
  type DataViewSelectFilterProps,
} from './DataViewSelectFilter';

export type DataViewSingleSelectFilterProps = Omit<
  DataViewSelectFilterProps,
  'selectionMode' | 'onSelect'
>;

const handleSingleSelect = (
  value: string[],
  onChange: DataViewSingleSelectFilterProps['onChange'],
  event?: ReactMouseEvent,
  itemId?: string | number,
) => {
  const activeItem = String(itemId);
  if (!value.includes(activeItem)) {
    onChange?.(event, [activeItem]);
  }
};

export const DataViewSingleSelectFilter: FC<
  DataViewSingleSelectFilterProps
> = ({
  value = [],
  onChange,
  ouiaId = 'DataViewSingleSelectFilter',
  ...props
}) => (
  <DataViewSelectFilter
    {...props}
    value={value}
    onChange={onChange}
    ouiaId={ouiaId}
    selectionMode="single"
    onSelect={(event, itemId) =>
      handleSingleSelect(value, onChange, event, itemId)
    }
  />
);

export default DataViewSingleSelectFilter;
