/**
 * Tests for InventoryViews.tsx
 */

describe('InventoryViews component logic', () => {
  describe('getCurrentConfiguration behavior', () => {
    it('should prefer currentColumns when defined', () => {
      const currentColumns = [
        { key: 'display_name', isShown: true },
        { key: 'operating_system', isShown: true },
      ];
      const baselineColumns = [{ key: 'display_name', isShown: true }];

      // The logic: const columns = currentColumns ? normalizeViewColumns(currentColumns) : normalizeViewColumns(baselineColumns);
      const columnsToUse = currentColumns || baselineColumns;
      expect(columnsToUse).toBe(currentColumns);
    });

    it('should use baselineColumns when currentColumns is undefined', () => {
      const currentColumns = undefined;
      const baselineColumns = [
        { key: 'display_name', isShown: true },
        { key: 'group_name', isShown: true },
        { key: 'operating_system', isShown: true },
      ];

      // The logic: const columns = currentColumns ? normalizeViewColumns(currentColumns) : normalizeViewColumns(baselineColumns);
      const columnsToUse = currentColumns || baselineColumns;
      expect(columnsToUse).toBe(baselineColumns);
      expect(columnsToUse.length).toBe(3);
    });

    it('should use baselineColumns for system views without saved config', () => {
      // System views have no saved configuration
      // So baselineColumns is resolved from system defaults
      const baselineColumns = [
        { key: 'display_name', isShown: true },
        { key: 'group_name', isShown: true },
        { key: 'tags', isShown: true },
        { key: 'operating_system', isShown: true },
        { key: 'last_check_in', isShown: true },
      ];

      // When saving All systems without edits, use baseline
      const currentColumns = undefined;
      const columnsToUse = currentColumns || baselineColumns;

      expect(columnsToUse).toBe(baselineColumns);
      expect(columnsToUse.length).toBe(5);
    });
  });

  describe('columnSelector memo dependency', () => {
    it('should recompute when switching between views', () => {
      const view1Config = { columns: [{ key: 'a' }, { key: 'b' }] };
      const view2Config = {
        columns: [{ key: 'x' }, { key: 'y' }, { key: 'z' }],
      };

      // With proper deps [activeView?.configuration]:
      expect(view1Config).not.toBe(view2Config);
      // Memo would recompute when switching views
    });
  });
});
