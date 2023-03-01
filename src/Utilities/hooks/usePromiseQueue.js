import { useCallback, useState } from 'react';
import pAll from 'p-all';

const DEFAULT_CONCURRENT_PROMISES = 2;

const usePromiseQueue = (limit = DEFAULT_CONCURRENT_PROMISES) => {
    const [results, setResults] = useState({
        isResolving: false,
        promiseResults: undefined
    });

    const resolve = useCallback(
        async (fns) => {
            await setResults((state) => ({
                ...state,
                isResolving: true
            }));
            const results = await pAll(fns, {
                concurrency: limit
            });
            await setResults({
                isResolving: false,
                promiseResults: results
            });

            return results;
        },
        [limit]
    );

    return {
        isResolving: results.isResolving,
        results: results.promiseResults,
        resolve
    };
};

export default usePromiseQueue;
