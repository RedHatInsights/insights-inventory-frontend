import React, { type FC, type MouseEvent as ReactMouseEvent } from 'react';
import {
  DataViewSelectFilter,
  type DataViewSelectFilterProps,
} from './DataViewSelectFilter';

export type DataViewCheckboxFilterProps = Omit<
  DataViewSelectFilterProps,
  'selectionMode' | 'onSelect'
>;

const handleMultiSelect = (
  value: string[],
  onChange: DataViewCheckboxFilterProps['onChange'],
  event?: ReactMouseEvent,
  itemId?: string | number,
) => {
  const activeItem = String(itemId);
  onChange?.(
    event,
    value.includes(activeItem)
      ? value.filter((item) => item !== activeItem)
      : [activeItem, ...value],
  );
};

export const DataViewCheckboxFilter: FC<DataViewCheckboxFilterProps> = ({
  value = [],
  onChange,
  ouiaId = 'DataViewCheckboxFilter',
  ...props
}) => (
  <DataViewSelectFilter
    {...props}
    value={value}
    onChange={onChange}
    ouiaId={ouiaId}
    selectionMode="multi"
    onSelect={(event, itemId) =>
      handleMultiSelect(value, onChange, event, itemId)
    }
  />
);

export default DataViewCheckboxFilter;
