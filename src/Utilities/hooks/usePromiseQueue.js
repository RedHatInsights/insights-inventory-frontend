import { useCallback, useState } from 'react';
import pAll from 'p-all';

const DEFAULT_CONCURRENT_PROMISES = 2;

const usePromiseQueue = (limit = DEFAULT_CONCURRENT_PROMISES) => {
    const [isResolving, setIsResolving] = useState(false);
    const [promiseResults, setPromiseResults] = useState();

    const resolve = useCallback(
        async (fns) => {
            await setPromiseResults(undefined);
            await setIsResolving(true);
            const results = await pAll(fns, {
                concurrency: limit
            });

            await setIsResolving(false);
            await setPromiseResults(results);

            return results;
        },
        [limit]
    );

    return {
        isResolving,
        results: promiseResults,
        resolve
    };
};

export default usePromiseQueue;
