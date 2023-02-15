
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { ACTION_TYPES } from './action-types';

export const initialState = {
    loading: false,
    rejected: false,
    fulfilled: false,
    error: null,
    data: null
};

export default applyReducerHash(
    {
        [ACTION_TYPES.GROUPS_PENDING]: (state) => {
            return {
                ...state,
                loading: true
            };
        },
        [ACTION_TYPES.GROUPS_FULFILLED]: (state, { payload }) => {
            return {
                ...state,
                loading: false,
                rejected: false,
                fulfilled: true,
                data: payload
            };
        },
        [ACTION_TYPES.GROUPS_REJECTED]: (state, { payload: { code, status } }) => {
            return {
                ...state,
                loading: false,
                rejected: true,
                fulfilled: false,
                code,
                status
            };
        }
    },
    initialState
);
