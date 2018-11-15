import MiddlewareListener from '@red-hat-insights/insights-frontend-components/Utilities/MiddlewareListener';
import { getRegistry } from '@red-hat-insights/insights-frontend-components';
import { notificationsMiddleware } from '@red-hat-insights/insights-frontend-components/components/Notifications/';
import promiseMiddleware from 'redux-promise-middleware';
export { default as reducers, entitiesReducer, entitesDetailReducer } from './reducers';

let middlewareListener;

export function init (...middleware) {
    middlewareListener = new MiddlewareListener();
    return getRegistry(
        {}, [
            middlewareListener.getMiddleware(),
            promiseMiddleware(),
            notificationsMiddleware(),
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
