import { useEffect, useRef } from 'react';
import type { SortDirection } from '../SystemsView';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';
import type { InventoryFilters } from '../filters/SystemsViewFilters';
import type { Column } from '../columns/allColumnDefinitions';
import {
  saveInventoryTableDraft,
  toStoredColumnPreferences,
} from '../utils/inventoryTableDraftStorage';

interface UsePersistInventoryTableDraftParams {
  orgId: string | undefined;
  columns: readonly Column[];
  filters: InventoryFilters;
  lastSeenCustomRange: LastSeenCustomRange;
  sortBy?: string;
  direction?: SortDirection;
  page: number;
  perPage: number;
  isReady: boolean;
}

export const usePersistInventoryTableDraft = ({
  orgId,
  columns,
  filters,
  lastSeenCustomRange,
  sortBy,
  direction,
  page,
  perPage,
  isReady,
}: UsePersistInventoryTableDraftParams) => {
  const skipInitialPersistRef = useRef(true);

  useEffect(() => {
    if (!isReady || orgId === undefined) {
      return;
    }

    if (skipInitialPersistRef.current) {
      skipInitialPersistRef.current = false;
      return;
    }

    saveInventoryTableDraft(orgId, {
      columns: toStoredColumnPreferences(columns),
      filters,
      lastSeenCustomRange,
      ...(sortBy &&
        direction && {
          sort: { sortBy, direction },
        }),
      pagination: { page, perPage },
    });
  }, [
    columns,
    direction,
    filters,
    isReady,
    lastSeenCustomRange,
    orgId,
    page,
    perPage,
    sortBy,
  ]);
};
