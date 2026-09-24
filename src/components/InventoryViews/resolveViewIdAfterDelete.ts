import type { InventoryView } from '../../api/inventoryViewsApi';

/**
 * Picks which view to land on after the *active* view is deleted, mirroring the
 * backend's read-time fallback:
 * - a *non*-default view was deleted: the user's pinned default (unchanged).
 * - the default itself was deleted: the "All systems" system view.
 *
 * Returns the target view id, or `undefined` when no system view is available
 * to fall back to (the caller then clears the view_id entirely). The caller
 * navigates with a clean URL so the deleted view's filters/sort don't carry
 * over, and stamps this target directly rather than re-deriving it — until the
 * views query refetches, `backendDefaultViewId` may still point at the just
 * deleted view, so re-derivation would briefly flash it.
 *
 *  @param deletedViewId        - the id of the view that was just deleted
 *  @param backendDefaultViewId - the `default_view_id` from GET /views
 *  @param viewsList            - the loaded inventory views
 *  @returns                    the id of the view to land on, or undefined
 */
export const resolveViewIdAfterDelete = (
  deletedViewId: string,
  backendDefaultViewId: string | undefined,
  viewsList: InventoryView[],
): string | undefined =>
  backendDefaultViewId && backendDefaultViewId !== deletedViewId
    ? backendDefaultViewId
    : viewsList.find((v) => v.is_system_view)?.id;
