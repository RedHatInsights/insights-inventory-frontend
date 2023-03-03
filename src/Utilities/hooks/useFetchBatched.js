import usePromiseQueue from './usePromiseQueue';

const useFetchBatched = () => {
    const { isResolving: isLoading, resolve } = usePromiseQueue();

    return {
        isLoading,
        fetchBatched: (fetchFunction, total, filter, batchSize = 50) => {
            const pages = Math.ceil(total / batchSize) || 1;

            const results = resolve(
                [...new Array(pages)].map(
                    (_, pageIdx) => () => fetchFunction(filter, { page: pageIdx + 1, perPage: batchSize })
                )
            );

            return results;
        }
    };
};

export default useFetchBatched;
