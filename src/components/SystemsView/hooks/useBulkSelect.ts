import { useCallback } from 'react';
import { DataViewTrObject } from '@patternfly/react-data-view';
import type { SystemsViewSelection } from '../SystemsView';

interface UseBulkSelectParams {
  selection: SystemsViewSelection;
  rows: DataViewTrObject[];
}

export const useBulkSelect = ({ selection, rows }: UseBulkSelectParams) => {
  const { selected, setSelected, onSelect, isSelected } = selection;

  const isPageSelected = useCallback(
    (rows: DataViewTrObject[]) =>
      rows.length > 0 && rows.every((row) => isSelected(row)),
    [isSelected],
  );

  const isPagePartiallySelected = useCallback(
    (rows: DataViewTrObject[]) => {
      const pagePartiallySelected = rows.some((row) => isSelected(row));
      const pageFullSelected = isPageSelected(rows);
      return (
        (pagePartiallySelected && !pageFullSelected) ||
        (!pagePartiallySelected && selected.length > 0)
      );
    },
    [isSelected, isPageSelected, selected.length],
  );

  const onBulkSelect = useCallback(
    async (value: string) => {
      const pageIsSelected =
        rows.length > 0 && rows.every((row) => isSelected(row));
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
    [isSelected, setSelected, onSelect, rows],
  );

  return {
    isPageSelected: isPageSelected(rows),
    isPagePartiallySelected: isPagePartiallySelected(rows),
    onBulkSelect,
  };
};
