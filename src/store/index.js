import ReducerRegistry from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';
import MiddlewareListener from '@red-hat-insights/insights-frontend-components/Utilities/MiddlewareListener';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from './reducers';

let registry;
let middlewareListener;

export function init (...middleware) {
    if (registry) {
        throw new Error('store already initialized');
    }

    middlewareListener = new MiddlewareListener();

    registry = new ReducerRegistry({}, [
        middlewareListener.getMiddleware(),
        promiseMiddleware(),
        ...middleware
    ]);

    registry.register(reducers);
    return registry;
}

export function getStore () {
    return registry.getStore();
}

export function register (...args) {
    return registry.register(...args);
}

export function addNewListener ({ actionType, callback }) {
    return middlewareListener.addNew({
        on: actionType,
        callback
    });
}
