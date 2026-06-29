import { useEffect, useRef } from 'react';
import type { DependencyList } from 'react';
import { readInventoryTableDraft } from '../utils/inventoryTableDraftStorage';
import type { InventoryTableDraft } from '../utils/inventoryTableDraftStorage';

interface UseHydrateDraftFieldOptions {
  /**
   * Additional condition that must be true for hydration to occur.
   * Checked after standard guards (isDraftReady, orgId, hydratedRef).
   */
  shouldHydrate?: () => boolean;
  /**
   * Extra dependencies to include in the useEffect dependency array.
   * Use when shouldHydrate references reactive values.
   */
  extraDeps?: DependencyList;
}

/**
 * Shared hook for hydrating a single field from localStorage draft.
 *
 * Handles common hydration pattern:
 * - Guard against premature hydration (isDraftReady, orgId)
 * - Ensure one-time hydration (useRef tracking)
 * - Read from localStorage
 * - Call onHydrate callback with value
 *
 *  @param orgId
 *  @param isDraftReady
 *  @param fieldKey
 *  @param onHydrate
 *  @param options
 * @example
 * // Hydrate columns
 * useHydrateDraftField(
 *   orgId,
 *   isDraftReady,
 *   'columns',
 *   (columns) => setColumnsState(mergeColumnsWithDraft(defaultColumns, columns))
 * );
 *
 * @example
 * // Hydrate with conditional check
 * useHydrateDraftField(
 *   orgId,
 *   isDraftReady,
 *   'lastSeenCustomRange',
 *   setLastSeenCustomRange,
 *   {
 *     shouldHydrate: () => normalizeLastSeenFilterValue(rawFilters.last_seen) === 'custom',
 *     extraDeps: [rawFilters.last_seen]
 *   }
 * );
 */
export const useHydrateDraftField = <K extends keyof InventoryTableDraft>(
  orgId: string | undefined,
  isDraftReady: boolean,
  fieldKey: K,
  onHydrate: (value: NonNullable<InventoryTableDraft[K]>) => void,
  options?: UseHydrateDraftFieldOptions,
) => {
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Standard guards
    if (!isDraftReady || orgId === undefined || hydratedRef.current) {
      return;
    }

    // Optional additional condition
    if (options?.shouldHydrate && !options.shouldHydrate()) {
      return;
    }

    // Read draft and hydrate
    const draft = readInventoryTableDraft(orgId);
    const value = draft?.[fieldKey];

    if (value !== undefined && value !== null) {
      hydratedRef.current = true;
      onHydrate(value as NonNullable<InventoryTableDraft[K]>);
    }
  }, [isDraftReady, orgId, fieldKey, onHydrate, ...(options?.extraDeps || [])]);
};
