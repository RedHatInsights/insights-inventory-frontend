import { useEffect, useRef } from 'react';
import { INITIAL_PAGE } from '../../InventoryViews/constants';

type SetPage = (
  event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
  page: number,
) => void;

/**
 * Moves the table off a page the current result set does not contain.
 * A not-found page steps back one page. If that page is not found either,
 * the next step is page 1, so a far-out URL does not walk down one page at a time.
 * A successful total that cannot fill the current page jumps to its last page.
 *
 *  @returns Whether the current page is a not-found page above page 1. Callers
 *   should keep showing the loading state until the corrected page resolves.
 */
export const useCorrectOutOfRangePage = ({
  page,
  perPage,
  total,
  isPageNotFound,
  isSuccess,
  onSetPage,
}: {
  page: number;
  perPage: number;
  total: number | undefined;
  isPageNotFound: boolean;
  isSuccess: boolean;
  onSetPage: SetPage;
}): boolean => {
  const onSetPageRef = useRef(onSetPage);
  onSetPageRef.current = onSetPage;
  const correctionRef = useRef<{ to: number } | null>(null);

  useEffect(() => {
    if (!isSuccess) return;

    correctionRef.current = null;
    if (total == null) return;

    const lastPage = Math.max(INITIAL_PAGE, Math.ceil(total / perPage));
    if (page > lastPage) {
      onSetPageRef.current(undefined, lastPage);
    }
  }, [isSuccess, total, perPage, page]);

  useEffect(() => {
    if (!isPageNotFound || page <= INITIAL_PAGE) return;

    const nextPage =
      correctionRef.current?.to === page ? INITIAL_PAGE : page - 1;
    correctionRef.current = { to: nextPage };
    onSetPageRef.current(undefined, nextPage);
  }, [isPageNotFound, page]);

  return isPageNotFound && page > INITIAL_PAGE;
};
