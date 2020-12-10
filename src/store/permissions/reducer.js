import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/files/esm/ReducerRegistry';
import { ACTION_TYPES } from '../../constants';

const loadWritePermissionsPending = (state) => ({
    ...state,
    loadingFailed: false,
    loading: true,
    writePermissions: undefined
});

const loadWritePermissionsFulfilled = (state, { payload }) => ({
    ...state,
    loading: false,
    loadingFailed: false,
    writePermissions: payload.writePermissions
});

const loadWritePermissionsFailed = (state) => ({
    ...state,
    loading: false,
    loadingFailed: true
});

const defaultPermissionState = {
    loading: true,
    writePermissions: false,
    loadingFailed: false
};

const permissionsReducer = applyReducerHash(
    {
        [`${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_PENDING`]: loadWritePermissionsPending,
        [`${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_FULFILLED`]: loadWritePermissionsFulfilled,
        [`${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_FAILED`]: loadWritePermissionsFailed
    },
    defaultPermissionState
);

export default permissionsReducer;
