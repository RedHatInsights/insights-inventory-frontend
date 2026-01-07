import { useCallback } from 'react';
import { DataViewTrObject } from '@patternfly/react-data-view';
import { SystemsViewSelection } from '../SystemsViewTable';

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
    (rows: DataViewTrObject[]) =>
      rows.some((row) => isSelected(row)) && !isPageSelected(rows),
    [isSelected, isPageSelected],
  );

  const onBulkSelect = useCallback(
    async (value: string) => {
      switch (value) {
        case 'none':
        case 'nonePage':
          setSelected([]);
          break;
        case 'page':
          if (selected.length === 0) {
            onSelect(true, rows);
          } else {
            setSelected([]);
          }
          break;
      }
    },
    [selected.length, setSelected, onSelect, rows],
  );

  return {
    isPageSelected: isPageSelected(rows),
    isPagePartiallySelected: isPagePartiallySelected(rows),
    onBulkSelect,
  };
};
