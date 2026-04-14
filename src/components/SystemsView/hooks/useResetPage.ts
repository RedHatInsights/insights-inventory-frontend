import { useDataViewPagination } from '@patternfly/react-data-view';
import { useEffect, useMemo, useRef } from 'react';
import type { InventoryFilters } from '../filters/SystemsViewFilters';
import { INITIAL_PAGE } from '../../InventoryViews/constants';

type DataViewPagination = ReturnType<typeof useDataViewPagination>;

/**
 * Resets DataView pagination to the first page whenever `filters` meaningfully
 * change, after the initial mount. Runs in an effect so URL updates from the
 * filter hook and pagination hook do not race in the same event handler.
 *
 *  @param filters             - Filter state; compared via JSON serialization between runs.
 *  @param pagination          - Return value of `useDataViewPagination`.
 *  @param additionalSignature - Optional extra value merged into the serialized signature (e.g. last-seen custom range).
 */
export const useResetPage = (
  filters: InventoryFilters,
  pagination: DataViewPagination,
  additionalSignature?: unknown,
) => {
  /* `pagination.onSetPage` is a new function each render;
  The ref holds the latest version so we can use it in Effect. */
  const onSetPageRef = useRef(pagination.onSetPage);
  onSetPageRef.current = pagination.onSetPage;

  const filtersSignature = useMemo(
    () => JSON.stringify({ filters, additionalSignature }),
    [filters, additionalSignature],
  );
  const isInitialRun = useRef(true);

  useEffect(() => {
    if (isInitialRun.current) {
      isInitialRun.current = false;
      return;
    }
    onSetPageRef.current(undefined, INITIAL_PAGE);
  }, [filtersSignature]);
};
