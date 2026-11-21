import { useEffect, useRef, type MutableRefObject } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';

export type PageCorrection = {
  signature: string;
  page: number;
};

/**
 * Writes `page` into the URL when the requested page is past the last page of
 * results. The marker covers only that correction and is cleared once it ends.
 *
 *  @param page                  - Page to store, or null when no correction is in progress.
 *  @param setSearchParams       - React-router setSearchParams for setting `page` in the URL.
 *  @param signature             - Result set (filters, sort, page size).
 *  @param correctedSignatureRef - In-progress correction. Cleared when `page` is null.
 */
export const useRecoveryPage = (
  page: number | null,
  setSearchParams: SetURLSearchParams,
  signature: string,
  correctedSignatureRef: MutableRefObject<PageCorrection | null>,
) => {
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  useEffect(() => {
    if (page == null) {
      if (correctedSignatureRef.current?.signature === signature) {
        correctedSignatureRef.current = null;
      }
      return;
    }

    correctedSignatureRef.current = { signature, page };
    setSearchParamsRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(page));
        return next;
      },
      { replace: true },
    );
  }, [page, signature, correctedSignatureRef]);
};
