import { useEffect, useMemo, useRef } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';
import type { InventoryFilters } from '../filters/SystemsViewFilters';
import { INITIAL_PAGE } from '../../InventoryViews/constants';

/**
 * Resets DataView pagination to the first page whenever `filters` meaningfully
 * change, after the initial mount.
 *
 *  @param filters             - Filter state; compared via JSON serialization between runs.
 *  @param setSearchParams     - React-router setSearchParams for setting page=1 in the URL.
 *  @param additionalSignature - Optional extra value merged into the serialized signature (e.g. last-seen custom range).
 */
export const useResetPage = (
  filters: InventoryFilters,
  setSearchParams: SetURLSearchParams,
  additionalSignature?: unknown,
) => {
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

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

    // The filter hook's navigate() already ran (synchronous
    // history.pushState), so window.location.search is up-to-date.
    const correctParams = new URLSearchParams(window.location.search);
    correctParams.set('page', String(INITIAL_PAGE));
    setSearchParamsRef.current(correctParams, { replace: true });
  }, [filtersSignature]);
};
