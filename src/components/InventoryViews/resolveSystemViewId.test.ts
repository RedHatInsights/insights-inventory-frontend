import { expect } from '@jest/globals';
import { resolveSystemViewId } from './resolveSystemViewId';
import {
  ALL_SYSTEMS_VIEW_NAME,
  type InventoryView,
} from '../../api/inventoryViewsApi';

const makeView = (
  id: string,
  name: string,
  is_system_view = false,
): InventoryView => ({
  id,
  name,
  is_system_view,
  is_owner: !is_system_view,
  org_wide: is_system_view,
  configuration: { columns: [] },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

describe('resolveSystemViewId', () => {
  const allSystems = makeView('all-systems-uuid', ALL_SYSTEMS_VIEW_NAME, true);

  it('finds the All systems view', () => {
    expect(resolveSystemViewId([allSystems])).toBe('all-systems-uuid');
  });

  it('picks All systems even when another system view is listed first', () => {
    // The backend orders system views by modified_on among themselves, so a
    // more recently touched one can precede All systems in the response.
    const redHatDefault = makeView('rh-default-uuid', 'Red Hat Default', true);

    expect(resolveSystemViewId([redHatDefault, allSystems])).toBe(
      'all-systems-uuid',
    );
  });

  it('ignores a user view that happens to share the name', () => {
    // View names are not unique, so this is reachable.
    const impostor = makeView('user-view-uuid', ALL_SYSTEMS_VIEW_NAME);

    expect(resolveSystemViewId([impostor, allSystems])).toBe(
      'all-systems-uuid',
    );
  });

  it('falls back to any system view if All systems is renamed', () => {
    const renamed = makeView('renamed-uuid', 'Every system', true);

    expect(resolveSystemViewId([renamed])).toBe('renamed-uuid');
  });

  it('returns undefined when no system view is present', () => {
    expect(resolveSystemViewId([makeView('user-view', 'My view')])).toBe(
      undefined,
    );
  });

  it('returns undefined for an empty list', () => {
    expect(resolveSystemViewId([])).toBe(undefined);
  });
});
