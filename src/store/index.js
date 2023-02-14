
import MiddlewareListener from '@redhat-cloud-services/frontend-components-utilities/MiddlewareListener';
import notificationsMiddleware from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import promise  from 'redux-promise-middleware';
import reducers, { entitesDetailReducer, mergeWithDetail, mergeWithEntities, tableReducer } from './reducers';
export { default as reducers, tableReducer, entitesDetailReducer } from './reducers';
import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore } from 'redux';
import { INVENTORY_ACTION_TYPES } from './action-types';

let middlewareListener;

const appReducers = {
    ...reducers,
    ...mergeWithEntities(tableReducer),
    ...mergeWithDetail(entitesDetailReducer(INVENTORY_ACTION_TYPES))
};

const composeEnhancers = IS_DEV ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose) : compose;

export const getStore = (...middleware) => {
    middlewareListener = new MiddlewareListener();
    return createStore(combineReducers(appReducers), {}, composeEnhancers(applyMiddleware(...[
        middlewareListener.getMiddleware(),
        promise,
        notificationsMiddleware({
            errorTitleKey: ['message'],
            errorDescriptionKey: ['response.data.detail']
        }),
        ...middleware
    ])));
};

export const updateReducers = (newReducers = {}) =>
    combineReducers({
        ...appReducers,
        ...newReducers
    });

export function addNewListener ({ actionType, callback }) {
    return middlewareListener.addNew({
        on: actionType,
        callback
    });
}
