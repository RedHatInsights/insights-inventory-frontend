import { useCallback } from 'react';
import { DataViewTrObject } from '@patternfly/react-data-view';
import type { SystemsViewSelection } from '../SystemsView';

interface UseBulkSelectParams {
  selection: SystemsViewSelection;
  rows: DataViewTrObject[];
  total?: number;
}

export const useBulkSelect = ({
  selection,
  rows,
  total = 0,
}: UseBulkSelectParams) => {
  const { selected, setSelected, onSelect, isSelected } = selection;
  const isAnySelected = selected.length > 0;
  const isFullySelected = total > 0 && selected.length === total;
  const isPartiallySelected = isAnySelected && !isFullySelected;
  const isPageSelected =
    rows.length > 0 && rows.every((row) => isSelected(row));

  const onBulkSelect = useCallback(
    async (value: string) => {
      switch (value) {
        case 'none':
        case 'nonePage':
          setSelected([]);
          break;
        case 'page':
          if (isPartiallySelected) {
            setSelected([]);
          } else {
            onSelect(true, rows);
          }
          break;
      }
    },
    [isPartiallySelected, setSelected, onSelect, rows],
  );

  return {
    isPageSelected,
    isPartiallySelected,
    onBulkSelect,
  };
};
