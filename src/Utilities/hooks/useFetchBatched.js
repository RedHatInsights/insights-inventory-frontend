import { useCallback, useMemo } from 'react';
import usePromiseQueue from './usePromiseQueue';

const useFetchBatched = () => {
  const { isResolving: isLoading, resolve } = usePromiseQueue();
  const pageOffsetfetchBatched = useCallback(
    (fetchFunction, total, filter, batchSize = 50, pageOffset = 0) => {
      const pages = Math.ceil(total / batchSize) || 1;

      const results = resolve(
        [...new Array(pages)].map(
          (_, pageIdx) => () =>
            fetchFunction(filter, {
              page: pageOffset + pageIdx + 1,
              per_page: batchSize,
            }),
        ),
      );

      return results;
    },
    [resolve],
  );

  const fetchBatched = useMemo(
    () => ({
      isLoading,
      fetchBatched: (fetchFunction, total, filter, batchSize = 50) => {
        const pages = Math.ceil(total / batchSize) || 1;

        const results = resolve(
          [...new Array(pages)].map(
            (_, pageIdx) => () =>
              fetchFunction(filter, { page: pageIdx + 1, per_page: batchSize }),
          ),
        );

        return results;
      },
      fetchBatchedInline: (fetchFunction, list, batchSize = 20) => {
        const pages = Math.ceil(list.length / batchSize) || 1;

        const results = resolve(
          [...new Array(pages)].map(
            (_, pageIdx) => () =>
              fetchFunction(
                list.slice(batchSize * pageIdx, batchSize * (pageIdx + 1)),
              ),
          ),
        );

        return results;
      },
      pageOffsetfetchBatched,
    }),
    [isLoading, resolve, pageOffsetfetchBatched],
  );

  return fetchBatched;
};

export default useFetchBatched;
