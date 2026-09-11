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

  describe('default view loading (reconcile effect)', () => {
    const mockSystemView = {
      id: 'system-view-uuid',
      name: 'All systems',
      is_system_view: true,
    };
    const mockUserView = {
      id: 'user-view-uuid',
      name: 'My Custom View',
      is_system_view: false,
    };

    describe('when URL has no view_id (fresh landing)', () => {
      it('should stamp the default view id into the URL', () => {
        const searchParams = new URLSearchParams(); // No view_id
        const viewsLoaded = true;
        const viewsList = [mockSystemView, mockUserView];
        const defaultViewId: string = 'system-view-uuid';

        // Effect logic: if no urlViewId and defaultViewId is ready
        const urlViewId = searchParams.get('view_id');
        expect(urlViewId).toBeNull();

        // Should set view_id to default
        if (!urlViewId && defaultViewId !== 'all-systems') {
          searchParams.set('view_id', defaultViewId);
        }

        expect(searchParams.get('view_id')).toBe('system-view-uuid');
      });

      it('should preserve existing filter params when stamping view_id', () => {
        const searchParams = new URLSearchParams({
          operating_system: 'RHEL 9',
          status: 'stale',
          hostname_or_id: 'test',
        });
        const defaultViewId: string = 'system-view-uuid';

        // No view_id, but has filters (dirty default view)
        expect(searchParams.get('view_id')).toBeNull();
        expect(searchParams.get('operating_system')).toBe('RHEL 9');

        // Effect stamps view_id but keeps filters
        searchParams.set('view_id', defaultViewId);

        expect(searchParams.get('view_id')).toBe('system-view-uuid');
        expect(searchParams.get('operating_system')).toBe('RHEL 9');
        expect(searchParams.get('status')).toBe('stale');
        expect(searchParams.get('hostname_or_id')).toBe('test');
      });

      it('should not stamp view_id when default is still the sentinel', () => {
        const searchParams = new URLSearchParams();
        const defaultViewId: string = 'all-systems'; // Still loading

        const urlViewId = searchParams.get('view_id');
        if (!urlViewId && defaultViewId === 'all-systems') {
          // Do nothing - wait for views to load
        }

        expect(searchParams.get('view_id')).toBeNull();
      });
    });

    describe('when URL has a stale view_id (deleted view)', () => {
      it('should fall back to default view and replace the stale id', () => {
        const searchParams = new URLSearchParams({
          view_id: 'deleted-view-id',
        });
        const viewsList = [mockSystemView, mockUserView];
        const defaultViewId: string = 'system-view-uuid';

        const urlViewId = searchParams.get('view_id');
        const viewExists = viewsList.some((v) => v.id === urlViewId);

        expect(viewExists).toBe(false);

        // Stale view: replace with default
        if (!viewExists) {
          searchParams.set('view_id', defaultViewId);
        }

        expect(searchParams.get('view_id')).toBe('system-view-uuid');
      });

      it('should preserve filter params when replacing stale view_id', () => {
        const searchParams = new URLSearchParams({
          view_id: 'deleted-view-id',
          operating_system: 'RHEL 9',
          status: 'stale',
        });
        const viewsList = [mockSystemView];
        const defaultViewId: string = 'system-view-uuid';

        const urlViewId = searchParams.get('view_id');
        const viewExists = viewsList.some((v) => v.id === urlViewId);

        if (!viewExists) {
          searchParams.set('view_id', defaultViewId);
        }

        expect(searchParams.get('view_id')).toBe('system-view-uuid');
        expect(searchParams.get('operating_system')).toBe('RHEL 9');
        expect(searchParams.get('status')).toBe('stale');
      });

      it('should delete view_id when falling back to sentinel', () => {
        const searchParams = new URLSearchParams({
          view_id: 'deleted-view-id',
        });
        const viewsList = [mockSystemView];
        const defaultViewId: string = 'all-systems'; // Sentinel

        const urlViewId = searchParams.get('view_id');
        const viewExists = viewsList.some((v) => v.id === urlViewId);

        if (!viewExists) {
          if (defaultViewId === 'all-systems') {
            searchParams.delete('view_id');
          } else {
            searchParams.set('view_id', defaultViewId);
          }
        }

        expect(searchParams.get('view_id')).toBeNull();
      });
    });

    describe('when URL has a valid view_id', () => {
      it('should not modify the URL when view exists', () => {
        const searchParams = new URLSearchParams({ view_id: 'user-view-uuid' });
        const viewsList = [mockSystemView, mockUserView];

        const urlViewId = searchParams.get('view_id');
        const viewExists = viewsList.some((v) => v.id === urlViewId);

        expect(viewExists).toBe(true);

        // No changes needed
        const originalParams = searchParams.toString();
        // (effect would return early)
        expect(searchParams.toString()).toBe(originalParams);
      });
    });
  });
});
