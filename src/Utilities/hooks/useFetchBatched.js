import usePromiseQueue from './usePromiseQueue';

const useFetchBatched = () => {
  const { isResolving: isLoading, resolve } = usePromiseQueue();

  return {
    isLoading,
    fetchBatched: (fetchFunction, total, filter, batchSize = 50) => {
      const pages = Math.ceil(total / batchSize) || 1;

      const results = resolve(
        [...new Array(pages)].map(
          // eslint-disable-next-line camelcase
          (_, pageIdx) => () =>
            fetchFunction(filter, { page: pageIdx + 1, per_page: batchSize })
        )
      );

      return results;
    },
    fetchBatchedInline: (fetchFunction, list, batchSize = 20) => {
      const pages = Math.ceil(list.length / batchSize) || 1;

      const results = resolve(
        [...new Array(pages)].map(
          (_, pageIdx) => () =>
            fetchFunction(
              list.slice(batchSize * pageIdx, batchSize * (pageIdx + 1))
            )
        )
      );

      return results;
    },
  };
};

export default useFetchBatched;
