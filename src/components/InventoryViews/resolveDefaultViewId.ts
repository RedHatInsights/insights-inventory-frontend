import {
  ALL_SYSTEMS_VIEW_ID,
  type InventoryView,
} from '../../api/inventoryViewsApi';

/**
 * Resolves which view to load when the URL carries no `view_id` (e.g. landing on
 * `/insights/inventory` fresh, or an old bookmark without the param).
 *
 * Today this is the "All systems" read-only system view — the same fallback the
 * backend uses. Once a user-pinned default view lands (see
 * insights-host-inventory#4903: `get_default_view_id` returns the user's pinned
 * view UUID and falls back to the system view), this is the single place to swap
 * in that resolution: prefer the pinned default, then the system view, then the
 * `ALL_SYSTEMS_VIEW_ID` sentinel while views are still loading.
 *
 *  @param viewsList - the loaded inventory views
 *  @returns         the id of the view to load by default
 */
export const resolveDefaultViewId = (
  viewsList: readonly InventoryView[],
): string => viewsList.find((v) => v.is_system_view)?.id ?? ALL_SYSTEMS_VIEW_ID;
