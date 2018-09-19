import MiddlewareListener from '@red-hat-insights/insights-frontend-components/Utilities/MiddlewareListener';
import { getRegistry } from '@red-hat-insights/insights-frontend-components/Utilities/Registry';
import promiseMiddleware from 'redux-promise-middleware';
export { default as reducers, asyncReducers } from './reducers';

let middlewareListener;

export function init (...middleware) {
    middlewareListener = new MiddlewareListener();
    return getRegistry(
        {}, [
            middlewareListener.getMiddleware(),
            promiseMiddleware(),
            ...middleware
        ]
    );
}

export function addNewListener ({ actionType, callback }) {
    return middlewareListener.addNew({
        on: actionType,
        callback
    });
}
