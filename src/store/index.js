
import { createContext } from 'react';
import MiddlewareListener from '@redhat-cloud-services/frontend-components-utilities/MiddlewareListener';
import { ReducerRegistry } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import notificationsMiddleware from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import promise  from 'redux-promise-middleware';
export { default as reducers, entitiesReducer, entitesDetailReducer } from './reducers';

export const RegistryContext = createContext({
    getRegistry: () => {}
});

let middlewareListener;

export function init (...middleware) {
    middlewareListener = new MiddlewareListener();
    return new ReducerRegistry(
        {},
        [
            middlewareListener.getMiddleware(),
            promise,
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
