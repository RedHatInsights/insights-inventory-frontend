import permissionsReducer from './reducer';
import { ACTION_TYPES } from '../../constants';

describe('permissionsReducer', () => {
    it('pending write permission', () => {
        expect(permissionsReducer({}, { type: `${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_PENDING` }))
        .toEqual({
            loading: true,
            loadingFailed: false,
            writePermissions: undefined
        });
    });

    it('fulfilled write permission - true', () => {
        expect(permissionsReducer(
            {},
            { type: `${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_FULFILLED`, payload: { writePermissions: true } }
        ))
        .toEqual({
            loading: false,
            loadingFailed: false,
            writePermissions: true
        });
    });

    it('fulfilled write permission - false', () => {
        expect(permissionsReducer(
            {},
            { type: `${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_FULFILLED`, payload: { writePermissions: false } }
        ))
        .toEqual({
            loading: false,
            loadingFailed: false,
            writePermissions: false
        });
    });

    it('failed write permission', () => {
        expect(permissionsReducer({}, { type: `${ACTION_TYPES.LOAD_WRITE_PERMISSIONS}_FAILED` }))
        .toEqual({
            loading: false,
            loadingFailed: true
        });
    });
});
