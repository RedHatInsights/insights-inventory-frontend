import {
  ALL_SYSTEMS_VIEW_NAME,
  type InventoryView,
} from '../../api/inventoryViewsApi';

/**
 * Resolves the real id of the seeded "All systems" view, used to swap the
 * `view_id=all-systems` alias that external apps (e.g. the Dashboard's
 * Systems inventory card) deep-link with for a shareable UUID.
 *
 * Matching on `is_system_view` alone is not enough: the backend computes that
 * flag as `org_id IS NULL`, so it means "global view" and several may exist
 * (see insights-host-inventory `lib/views_repository.py`). Those are ordered by
 * `modified_on` among themselves, so the first one is not reliably All systems.
 * The name is the key the backend itself looks this view up by, but names are
 * not unique, so a user-created view could share it — hence both predicates.
 *
 * Falls back to any system view so a future rename degrades to the previous
 * behaviour rather than failing to resolve at all.
 *
 *  @param viewsList - the loaded inventory views
 *  @returns         the id of the All systems view, or undefined if not loaded
 */
export const resolveSystemViewId = (
  viewsList: readonly InventoryView[],
): string | undefined =>
  viewsList.find((v) => v.is_system_view && v.name === ALL_SYSTEMS_VIEW_NAME)
    ?.id ?? viewsList.find((v) => v.is_system_view)?.id;
