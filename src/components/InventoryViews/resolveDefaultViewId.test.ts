import { expect } from '@jest/globals';
import { resolveDefaultViewId } from './resolveDefaultViewId';
import { ALL_SYSTEMS_VIEW_ID } from '../../api/inventoryViewsApi';
import type { InventoryView } from '../../api/inventoryViewsApi';

describe('resolveDefaultViewId', () => {
  it('returns the system view id when a system view exists', () => {
    const views: InventoryView[] = [
      {
        id: 'user-view-1',
        name: 'My Custom View',
        is_system_view: false,
        is_owner: true,
        org_wide: false,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'system-view-uuid',
        name: 'All systems',
        is_system_view: true,
        is_owner: false,
        org_wide: true,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user-view-2',
        name: 'Another Custom View',
        is_system_view: false,
        is_owner: true,
        org_wide: false,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    expect(resolveDefaultViewId(views)).toBe('system-view-uuid');
  });

  it('returns ALL_SYSTEMS_VIEW_ID sentinel when no system view exists yet', () => {
    const views: InventoryView[] = [
      {
        id: 'user-view-1',
        name: 'My Custom View',
        is_system_view: false,
        is_owner: true,
        org_wide: false,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    expect(resolveDefaultViewId(views)).toBe(ALL_SYSTEMS_VIEW_ID);
  });

  it('returns ALL_SYSTEMS_VIEW_ID sentinel when views list is empty', () => {
    expect(resolveDefaultViewId([])).toBe(ALL_SYSTEMS_VIEW_ID);
  });

  it('trusts the backend default_view_id when provided', () => {
    const views: InventoryView[] = [
      {
        id: 'system-view-uuid',
        name: 'All systems',
        is_system_view: true,
        is_owner: false,
        org_wide: true,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user-pinned-view',
        name: 'My Pinned View',
        is_system_view: false,
        is_owner: true,
        org_wide: false,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    // The backend default wins over the system-view fallback.
    expect(resolveDefaultViewId(views, 'user-pinned-view')).toBe(
      'user-pinned-view',
    );
  });

  it('falls back to the system view when backendDefaultViewId is undefined', () => {
    const views: InventoryView[] = [
      {
        id: 'system-view-uuid',
        name: 'All systems',
        is_system_view: true,
        is_owner: false,
        org_wide: true,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    expect(resolveDefaultViewId(views, undefined)).toBe('system-view-uuid');
  });

  it('returns the first system view when multiple system views exist (edge case)', () => {
    const views: InventoryView[] = [
      {
        id: 'system-view-1',
        name: 'All systems',
        is_system_view: true,
        is_owner: false,
        org_wide: true,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'system-view-2',
        name: 'Another System View',
        is_system_view: true,
        is_owner: false,
        org_wide: true,
        configuration: { columns: [] },
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ];

    // Should return the first one found
    expect(resolveDefaultViewId(views)).toBe('system-view-1');
  });
});
