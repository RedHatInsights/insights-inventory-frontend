import { expect } from '@jest/globals';
import { resolveViewIdAfterDelete } from './resolveViewIdAfterDelete';
import type { InventoryView } from '../../api/inventoryViewsApi';

const makeView = (id: string, is_system_view = false): InventoryView => ({
  id,
  name: id,
  is_system_view,
  is_owner: !is_system_view,
  org_wide: is_system_view,
  configuration: { columns: [] },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

describe('resolveViewIdAfterDelete', () => {
  const systemView = makeView('system-view-uuid', true);
  const pinnedView = makeView('user-pinned-view');
  const otherView = makeView('some-other-view');
  const views: InventoryView[] = [systemView, pinnedView, otherView];

  it('keeps the pinned default when a non-default view was deleted', () => {
    expect(
      resolveViewIdAfterDelete('some-other-view', 'user-pinned-view', views),
    ).toBe('user-pinned-view');
  });

  it('falls back to the system view when the pinned default itself was deleted', () => {
    expect(
      resolveViewIdAfterDelete('user-pinned-view', 'user-pinned-view', views),
    ).toBe('system-view-uuid');
  });

  it('falls back to the system view when there is no backend default', () => {
    expect(resolveViewIdAfterDelete('some-other-view', undefined, views)).toBe(
      'system-view-uuid',
    );
  });

  it('returns undefined when the default was deleted and no system view exists', () => {
    expect(
      resolveViewIdAfterDelete('user-pinned-view', 'user-pinned-view', [
        pinnedView,
        otherView,
      ]),
    ).toBeUndefined();
  });
});
