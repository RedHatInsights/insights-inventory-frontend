import MiddlewareListener from '@redhat-cloud-services/frontend-components-utilities/files/MiddlewareListener';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications';
import promiseMiddleware from 'redux-promise-middleware';
export { default as reducers, entitiesReducer, entitesDetailReducer } from './reducers';

let middlewareListener;

export function init (...middleware) {
    middlewareListener = new MiddlewareListener();
    return getRegistry(
        {}, [
            middlewareListener.getMiddleware(),
            promiseMiddleware(),
            notificationsMiddleware({
                errorDescriptionKey: ['detail', 'stack']
            }),
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
