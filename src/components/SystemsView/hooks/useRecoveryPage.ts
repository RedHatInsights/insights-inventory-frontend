import { useEffect, useRef, type MutableRefObject } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';

/**
 * Writes `page` into the URL when the requested page is past the last page of
 * results. Each `signature` is corrected once.
 *
 *  @param page                  - Page to store, or null when no correction is needed.
 *  @param setSearchParams       - React-router setSearchParams for setting `page` in the URL.
 *  @param signature             - Result set (filters, sort, page size). A new value may be corrected again.
 *  @param correctedSignatureRef - Set to `signature` after a correction so the query skips another redirect.
 */
export const useRecoveryPage = (
  page: number | null,
  setSearchParams: SetURLSearchParams,
  signature: string,
  correctedSignatureRef: MutableRefObject<string | null>,
) => {
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  useEffect(() => {
    if (page == null) return;

    correctedSignatureRef.current = signature;
    const correctParams = new URLSearchParams(window.location.search);
    correctParams.set('page', String(page));
    setSearchParamsRef.current(correctParams, { replace: true });
  }, [page, signature, correctedSignatureRef]);
};
