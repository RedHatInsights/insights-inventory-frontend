import { renderHook } from '@testing-library/react';
import { useBulkSelect, DataViewBulkSelection } from './useBulkSelect';
import { BulkSelectSource, BulkSelectValue } from '../../BulkSelect';
import { jest, expect } from '@jest/globals';
import '@testing-library/jest-dom';

interface TestItem {
  id: string;
  name: string;
}

const createMockSelection = (
  selected: TestItem[] = [],
): DataViewBulkSelection<TestItem> => {
  const setSelected = jest.fn();
  const onSelect = jest.fn();
  const isSelected = jest.fn((item: TestItem) =>
    selected.some((s) => s.id === item.id),
  );

  return {
    selected,
    setSelected,
    onSelect,
    isSelected,
  };
};

const createTestItems = (count: number): TestItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));

describe('useBulkSelect', () => {
  describe('fundamental behaviors', () => {
    it('returns correct initial state with no selection', () => {
      const rows = createTestItems(5);
      const selection = createMockSelection([]);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 10 }),
      );

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isPageSelected).toBe(false);
      expect(result.current.isPartiallySelected).toBe(false);
    });

    it('returns correct state when all items are selected', () => {
      const rows = createTestItems(5);
      const selection = createMockSelection(rows);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 5 }),
      );

      expect(result.current.selectedCount).toBe(5);
      expect(result.current.isPageSelected).toBe(true);
      expect(result.current.isPartiallySelected).toBe(false);
    });

    it('returns correct state when some items are selected', () => {
      const rows = createTestItems(5);
      const selectedItems = rows.slice(0, 2);
      const selection = createMockSelection(selectedItems);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 10 }),
      );

      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isPageSelected).toBe(false);
      expect(result.current.isPartiallySelected).toBe(true);
    });

    it('identifies page as selected when all current page items are selected even if total is higher', () => {
      const rows = createTestItems(5);
      const selection = createMockSelection(rows);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 20 }),
      );

      expect(result.current.isPageSelected).toBe(true);
      expect(result.current.isPartiallySelected).toBe(true);
    });
  });

  describe('onBulkSelect with different values and sources', () => {
    describe('BulkSelectValue.none', () => {
      it('clears selection when called from dropdown', async () => {
        const rows = createTestItems(5);
        const selectedItems = rows.slice(0, 3);
        const selection = createMockSelection(selectedItems);

        const { result } = renderHook(() =>
          useBulkSelect({ selection, rows, total: 10 }),
        );

        await result.current.onBulkSelect(BulkSelectValue.none, 'dropdown');

        expect(selection.setSelected).toHaveBeenCalledWith([]);
        expect(selection.onSelect).not.toHaveBeenCalled();
      });
    });

    describe('BulkSelectValue.nonePage', () => {
      it('clears selection when called from any source', async () => {
        const rows = createTestItems(5);
        const selectedItems = rows.slice(0, 3);
        const selection = createMockSelection(selectedItems);

        const { result } = renderHook(() =>
          useBulkSelect({ selection, rows, total: 10 }),
        );

        await result.current.onBulkSelect(BulkSelectValue.nonePage, 'dropdown');

        expect(selection.setSelected).toHaveBeenCalledWith([]);
        expect(selection.onSelect).not.toHaveBeenCalled();
      });
    });

    describe('BulkSelectValue.page', () => {
      it('selects all page items when called from dropdown', async () => {
        const rows = createTestItems(5);
        const selection = createMockSelection([]);

        const { result } = renderHook(() =>
          useBulkSelect({ selection, rows, total: 10 }),
        );

        await result.current.onBulkSelect(BulkSelectValue.page, 'dropdown');

        expect(selection.onSelect).toHaveBeenCalledWith(true, rows);
        expect(selection.setSelected).not.toHaveBeenCalled();
      });

      it('selects all page items when called from checkbox with no selection', async () => {
        const rows = createTestItems(5);
        const selection = createMockSelection([]);
        const { result } = renderHook(() =>
          useBulkSelect({ selection, rows, total: 10 }),
        );

        await result.current.onBulkSelect(BulkSelectValue.page, 'checkbox');

        expect(selection.onSelect).toHaveBeenCalledWith(true, rows);
        expect(selection.setSelected).not.toHaveBeenCalled();
      });

      it('clears selection when called from checkbox with partial selection', async () => {
        const rows = createTestItems(5);
        const selectedItems = rows.slice(0, 2);
        const selection = createMockSelection(selectedItems);

        const { result } = renderHook(() =>
          useBulkSelect({ selection, rows, total: 10 }),
        );

        await result.current.onBulkSelect(BulkSelectValue.page, 'checkbox');

        expect(selection.setSelected).toHaveBeenCalledWith([]);
        expect(selection.onSelect).not.toHaveBeenCalled();
      });

      it('selects page when called from checkbox with full selection', async () => {
        const rows = createTestItems(5);
        const selection = createMockSelection(rows);

        const { result } = renderHook(() =>
          useBulkSelect({ selection, rows, total: 5 }),
        );

        await result.current.onBulkSelect(BulkSelectValue.page, 'checkbox');

        expect(selection.onSelect).toHaveBeenCalledWith(true, rows);
        expect(selection.setSelected).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('selects no rows when selection is empty', () => {
      const rows: TestItem[] = [];
      const selection = createMockSelection([]);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 0 }),
      );

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isPageSelected).toBe(false);
      expect(result.current.isPartiallySelected).toBe(false);
    });

    it('handles selection count exceeding total', () => {
      const rows = createTestItems(5);
      const selectedItems = createTestItems(10);
      const selection = createMockSelection(selectedItems);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 5 }),
      );

      expect(result.current.selectedCount).toBe(10);
      expect(result.current.isPartiallySelected).toBe(true);
    });

    it('handles items selected that are not in current page', () => {
      const rows = createTestItems(5);
      const otherItems = createTestItems(3).map((item, i) => ({
        ...item,
        id: `other-${i}`,
      }));
      const selection = createMockSelection(otherItems);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 10 }),
      );

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isPageSelected).toBe(false);
      expect(result.current.isPartiallySelected).toBe(true);
    });

    it('handles mixed selection: some from current page, some from other pages', () => {
      const rows = createTestItems(5);
      const selectedFromPage = rows.slice(0, 2);
      const otherItems = [
        {
          id: 'other-1',
          name: 'Other 1',
        },
      ];
      const selection = createMockSelection([
        ...selectedFromPage,
        ...otherItems,
      ]);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 20 }),
      );

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isPageSelected).toBe(false);
      expect(result.current.isPartiallySelected).toBe(true);
    });

    it('handles rapid successive onBulkSelect calls', async () => {
      const rows = createTestItems(5);
      const selection = createMockSelection([]);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 10 }),
      );

      await result.current.onBulkSelect(BulkSelectValue.page, 'dropdown');
      await result.current.onBulkSelect(BulkSelectValue.none, 'dropdown');
      await result.current.onBulkSelect(BulkSelectValue.page, 'checkbox');

      expect(selection.onSelect).toHaveBeenCalledTimes(2);
      expect(selection.setSelected).toHaveBeenCalledTimes(1);
    });
  });

  describe('common use cases', () => {
    it('handles user selecting individual items then clicking select page', async () => {
      const rows = createTestItems(10);
      const selectedItems = rows.slice(0, 3);
      const selection = createMockSelection(selectedItems);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 50 }),
      );

      expect(result.current.isPartiallySelected).toBe(true);

      await result.current.onBulkSelect(BulkSelectValue.page, 'dropdown');

      expect(selection.onSelect).toHaveBeenCalledWith(true, rows);
    });

    it('handles user deselecting via checkbox when partially selected', async () => {
      const rows = createTestItems(10);
      const selectedItems = rows.slice(0, 5);
      const selection = createMockSelection(selectedItems);

      const { result } = renderHook(() =>
        useBulkSelect({ selection, rows, total: 50 }),
      );

      await result.current.onBulkSelect(BulkSelectValue.page, 'checkbox');

      expect(selection.setSelected).toHaveBeenCalledWith([]);
    });
  });
});
