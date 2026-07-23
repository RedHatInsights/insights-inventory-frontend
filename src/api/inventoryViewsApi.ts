// ============================================================================
// TYPE IMPORTS (from @redhat-cloud-services/host-inventory-client)
// ============================================================================

import type {
  ViewConfiguration,
  ViewIn,
  ViewOut,
  ViewPatch,
  ViewsListOut,
} from '@redhat-cloud-services/host-inventory-client/types';

// Re-export for convenience — consumers can import from this file
export type { ViewConfiguration, ViewIn, ViewOut, ViewPatch, ViewsListOut };

// Type aliases mapping to our domain terminology
export type CreateViewRequest = ViewIn;
export type UpdateViewRequest = ViewPatch;
export type InventoryView = ViewOut;

// ============================================================================
// DUMMY API FUNCTIONS (Replace with real API calls)
// ============================================================================

/**
 * DUMMY: List all inventory views visible to the requesting user
 *
 * Real implementation (RHINENG-28461):
 * - GET /api/inventory/v1/views
 * - RBAC: @access(KesselResourceTypes.VIEWS.view)
 * - Returns system views, user's own views, and org-wide views
 * - Each view includes computed is_owner boolean
 */
export const listViewsApi = async (): Promise<ViewsListOut> => {
  console.log('[DUMMY API] Listing views');

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return mock response matching paginated API structure
  return {
    count: 0,
    page: 1,
    per_page: 50,
    total: 0,
    results: [],
  };
};

/**
 * DUMMY: Create a new inventory view
 *
 * Real implementation (RHINENG-28461):
 * - POST /api/inventory/v1/views
 * - RBAC: @access(KesselResourceTypes.VIEWS.create)
 * - Backend sets org_id and created_by from Identity Header
 *  @param data
 */
export const createViewApi = async (
  data: CreateViewRequest,
): Promise<InventoryView> => {
  console.log('[DUMMY API] Creating view:', data);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock response matching V2 API structure
  return {
    id: `view-${Date.now()}`,
    org_id: 'org-123', // Would come from Identity Header
    name: data.name,
    description: data.description || '',
    is_system_view: false,
    configuration: data.configuration,
    org_wide: data.org_wide || false,
    created_by: 'current-user', // Would come from Identity Header
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_owner: true,
  };
};

/**
 * DUMMY: Update an existing inventory view
 *
 * Real implementation (RHINENG-28461):
 * - PUT /api/inventory/v1/views/{id}
 * - RBAC: @access(KesselResourceTypes.VIEWS.update, id_param="view_id")
 * - Ownership check: created_by must match requester
 * - Immutability check: is_system_view must be FALSE
 *  @param id
 *  @param data
 */
export const updateViewApi = async (
  id: string,
  data: UpdateViewRequest,
): Promise<InventoryView> => {
  console.log('[DUMMY API] Updating view:', id, data);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock response
  return {
    id,
    org_id: 'org-123',
    name: data.name || 'Updated View',
    description: data.description || '',
    is_system_view: false,
    configuration: data.configuration || { columns: [] },
    org_wide: data.org_wide || false,
    created_by: 'current-user',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date().toISOString(),
    is_owner: true,
  };
};

/**
 * DUMMY: Delete an inventory view
 *
 * Real implementation (RHINENG-28461):
 * - DELETE /api/inventory/v1/views/{id}
 * - RBAC: @access(KesselResourceTypes.VIEWS.delete, id_param="view_id")
 * - Ownership check: created_by must match requester
 * - Immutability check: is_system_view must be FALSE
 *  @param id
 */
export const deleteViewApi = async (id: string): Promise<void> => {
  console.log('[DUMMY API] Deleting view:', id);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // No return value for DELETE
};
