import { useEffect, useRef } from 'react';

type SetPage = (
  event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
  page: number,
) => void;

/**
 * Moves pagination to the last page `total` can fill when the current page is
 * past the end. Covers removing every row on the last page, and a URL page
 * that no longer exists.
 */
export const useClampPage = ({
  page,
  perPage,
  total,
  onSetPage,
}: {
  page: number;
  perPage: number;
  total: number | undefined;
  onSetPage: SetPage;
}) => {
  const onSetPageRef = useRef(onSetPage);
  onSetPageRef.current = onSetPage;

  useEffect(() => {
    if (total == null) return;

    const lastPage = Math.max(1, Math.ceil(total / perPage));
    if (page > lastPage) {
      onSetPageRef.current(undefined, lastPage);
    }
  }, [page, perPage, total]);
};
