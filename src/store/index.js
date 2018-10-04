import MiddlewareListener from '@red-hat-insights/insights-frontend-components/Utilities/MiddlewareListener';
import { getRegistry } from '@red-hat-insights/insights-frontend-components';
import promiseMiddleware from 'redux-promise-middleware';
export { default as reducers, entitiesReducer, entitesDetailReducer } from './reducers';

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
