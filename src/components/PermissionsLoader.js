import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import useInventoryWritePermissions from '../hooks/useInventoryWritePermissions';
import { ACTION_TYPES } from '../store/action-types';

const PermissionLoader = () => {
    const { isLoading, hasAccess } = useInventoryWritePermissions();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: `${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_PENDING` });
    }, []);

    useEffect(() => {
        if (!isLoading) {
            dispatch({ type: `${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_FULFILLED`, payload: { writePermissions: hasAccess } });
        }
    }, [isLoading]);

    return null;
};

export default PermissionLoader;
