import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOperatingSystems } from '../../store/inventory-actions';
import {
    buildOSFilterChip,
    getSelectedOsFilterVersions,
    groupOSFilterVersions,
    onOSFilterChange,
    toGroupSelection
} from '../../Utilities/OperatingSystemFilterHelpers';

export const OPERATING_SYSTEM_FILTER = 'OPERATING_SYSTEM_FILTER';
export const operatingSystemFilterReducer = (_state, { type, payload }) => ({
    ...type === OPERATING_SYSTEM_FILTER && {
        operatingSystemFilter: payload
    }
});

/**
* OS version filter hook.
* @param {Array} apiParams - an array containing parameters for GET /system_profile/operating_system call
* @return {Array} An array containing config object, chips array and value setter function.
*/
const useOperatingSystemFilter = (apiParams = []) => {
    const dispatch = useDispatch();
    const operatingSystems = useSelector(({ entities }) => entities?.operatingSystems);
    const operatingSystemsLoaded = useSelector(({ entities }) => entities?.operatingSystemsLoaded) || false;

    // selected versions has the boolean set to true
    const [selected, setSelected] = useState({});
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        dispatch(fetchOperatingSystems(apiParams));
    }, []);

    useEffect(() => {
        const newGroups = groupOSFilterVersions(operatingSystems);
        setGroups((operatingSystems || []).length === 0
            ? [{ items: [{ label: 'No versions available' }] }]
            : newGroups);
        setSelected(
            toGroupSelection(
                getSelectedOsFilterVersions(selected),
                (operatingSystems || []).map(({ value }) => value)
            )
        );
    }, [operatingSystems]);

    // PrimaryToolbar filter configuration
    const config = useMemo(() => ({
        label: 'Operating System',
        value: 'operating-system-filter',
        type: 'group',
        filterValues: {
            selected,
            groups,
            onChange: (event, newSelection, clickedGroup, clickedItem) => {
                setSelected(onOSFilterChange(event, newSelection, clickedGroup, clickedItem));
            }
        }
    }), [selected, groups]);

    const chips = useMemo(() => buildOSFilterChip(selected, operatingSystems), [selected, operatingSystems]);

    // receives an array of OS version values, e.g., ['7.3', '9.0']
    const setValue = useCallback((versions = []) => {
        setSelected(
            toGroupSelection(
                versions,
                operatingSystemsLoaded
                    ? (operatingSystems || []).map(({ value }) => value)
                    : undefined
            )
        );
    }, [operatingSystemsLoaded, operatingSystems]);

    const value = useMemo(() => getSelectedOsFilterVersions(selected), [selected]);

    return [config, chips, value, setValue];
};

export default useOperatingSystemFilter;
