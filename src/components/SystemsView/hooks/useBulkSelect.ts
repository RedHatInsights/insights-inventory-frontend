import { useCallback } from 'react';
import { DataViewTrObject } from '@patternfly/react-data-view';
import { BulkSelectSource, BulkSelectValue } from '../../BulkSelect';

export interface DataViewBulkSelection<T = DataViewTrObject> {
  selected: T[];
  setSelected: (items: T[]) => void;
  onSelect: (isSelecting: boolean, items?: T[] | T) => void;
  isSelected: (item: T) => boolean;
}

interface UseBulkSelectParams<T = DataViewTrObject> {
  selection: DataViewBulkSelection<T>;
  rows: T[];
  total?: number;
}

export const useBulkSelect = <T = DataViewTrObject>({
  selection,
  rows,
  total = 0,
}: UseBulkSelectParams<T>) => {
  const { selected, setSelected, onSelect, isSelected } = selection;

  const isFullySelected = total > 0 && selected.length === total;
  const isPartiallySelected = selected.length > 0 && !isFullySelected;
  const isPageSelected =
    rows.length > 0 && rows.every((row) => isSelected(row));

  const onBulkSelect = useCallback(
    async (value: BulkSelectValue, source: BulkSelectSource) => {
      switch (value) {
        case BulkSelectValue.none:
        case BulkSelectValue.nonePage:
          setSelected([]);
          break;
        case BulkSelectValue.page:
          if (source === 'dropdown') {
            onSelect(true, rows);
          } else if (source === 'checkbox') {
            if (isPartiallySelected) {
              setSelected([]);
            } else {
              onSelect(true, rows);
            }
          }
          break;
        default:
          break;
      }
    },
    [isPartiallySelected, setSelected, onSelect, rows],
  );

  return {
    isPageSelected,
    isPartiallySelected,
    onBulkSelect,
    selectedCount: selected.length,
  };
};
