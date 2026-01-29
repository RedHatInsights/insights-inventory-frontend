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

  const selectedCount = selected.length;
  const isAnySelected = selectedCount > 0;
  const isFullySelected = total > 0 && selectedCount === total;
  const isPartiallySelected = isAnySelected && !isFullySelected;

  const isPageSelected = useCallback(
    (rows: DataViewTrObject[]) =>
      rows.length > 0 && rows.every((row) => isSelected(row)),
    [isSelected],
  );

  const onBulkSelect = useCallback(
    async (value: string) => {
      const pageIsSelected = isPageSelected(rows);

      switch (value) {
        case 'none':
        case 'nonePage':
          setSelected([]);
          break;
        case 'page':
          if (!pageIsSelected) {
            onSelect(true, rows);
          }
          break;
      }
    },
    [isPageSelected, setSelected, onSelect, rows],
  );

  return {
    isPageSelected: isPageSelected(rows),
    isPagePartiallySelected: isPartiallySelected,
    onBulkSelect,
  };
};
