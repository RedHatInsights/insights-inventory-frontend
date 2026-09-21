import {
  ALL_SYSTEMS_VIEW_ID,
  type InventoryView,
} from '../../api/inventoryViewsApi';

/**
 * Resolves which view to load when the URL carries no `view_id` (e.g. landing on
 * `/insights/inventory` fresh, or an old bookmark without the param).
 *
 * The backend `default_view_id` (from GET /views) is authoritative: it's the
 * user's pinned view UUID, or the "All systems" system view UUID when no
 * preference is set or the pinned view is no longer visible (see
 * insights-host-inventory `get_default_view_id`). We trust it directly and only
 * fall back to the system view / `ALL_SYSTEMS_VIEW_ID` sentinel when it's absent
 * (views still loading).
 *
 *  @param viewsList            - the loaded inventory views
 *  @param backendDefaultViewId - the `default_view_id` from GET /views
 *  @returns                    the id of the view to load by default
 */
export const resolveDefaultViewId = (
  viewsList: readonly InventoryView[],
  backendDefaultViewId?: string,
): string =>
  backendDefaultViewId ??
  viewsList.find((v) => v.is_system_view)?.id ??
  ALL_SYSTEMS_VIEW_ID;
