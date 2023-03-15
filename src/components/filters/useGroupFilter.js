/* eslint-disable camelcase */
import union from 'lodash/union';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../store/inventory-actions';
import { HOST_GROUP_CHIP } from '../../Utilities/index';

//for attaching this filter to the redux
export const groupFilterState = { groupHostFilter: null };
export const GROUP_FILTER = 'GROUP_FILTER';
export const groupFilterReducer = (_state, { type, payload }) => ({
    ...type === GROUP_FILTER && {
        groupHostFilter: payload
    }
});

//receive the array of selected groups and return chips based on the name of selected groups
export const buildHostGroupChips = (selectedGroups = []) => {
    //we use new Set to make sure that chips are unique
    const chips = [...selectedGroups]?.map((group) => ({ name: group, value: group }));
    return chips?.length > 0
        ? [
            {
                category: 'Group',
                type: HOST_GROUP_CHIP,
                chips
            }
        ]
        : [];
};

const useGroupFilter = (apiParams = []) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchGroups(apiParams));
    }, []);
    //fetched values
    const fetchedValues = useSelector(({ groups })  => groups?.data?.results);
    //selected are the groups we selected
    const [selected, setSelected] = useState([]);
    //buildHostGroupsValues build an array of objects to populate dropdown
    const [buildHostGroupsValues, setBuildHostGroupsValues] = useState([]);
    //hostGroupValue is used for config items
    useEffect(() => {
        setBuildHostGroupsValues((fetchedValues || []).reduce((acc, group) => {
            acc.push({ label: group.name, value: group.name });
            return acc;
        }, []));
    }, [fetchedValues, selected]);
    //this is used in the filter config as a way to select values onChange
    const onHostGroupsChange = (event, selection, item) => {
        setSelected(union(selection, item));
    };

    const chips = useMemo(() => buildHostGroupChips(selected), [selected]);
    //chips that is built for the filter config

    //hostGroupConfig is a config that we use in EntityTableToolbar.js
    const hostGroupConfig = useMemo(() => ({
        label: 'Group',
        value: 'group-host-filter',
        type: 'checkbox',
        filterValues: {
            onChange: (event, value, item) => {
                onHostGroupsChange(event, value, item);
            },
            value: selected,
            items: buildHostGroupsValues
        }
    }), [selected, buildHostGroupsValues]);

    //setSelectedValues is used for selecting and deleting values
    const setSelectedValues = (currentValue = []) => {
        setSelected(currentValue);
    };

    return [hostGroupConfig, chips, selected, setSelectedValues];
};

export default useGroupFilter;
