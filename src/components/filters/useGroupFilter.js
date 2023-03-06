/* eslint-disable camelcase */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../store/inventory-actions';
import { HOST_GROUP_CHIP } from '../../Utilities/index';

//for attaching this filter to the redux
export const groupFilterState = { groupHostFilter: null };
export const GROUP_FILTER = 'GROUP_FILTER';
export const groupFilterReducer = (_state, { type, payload }) => ({
    ...type === GROUP_FILTER && {
        groupFilter: payload
    }
});

const mockApiResponse = [
    {
        created_at: '2023-02-28T12:35:20.071Z',
        host_ids: [
            'bA6deCFc19564430AB814bf8F70E8cEf'
        ],
        id: 'bA6deCFc19564430AB814bf8F70E8cEf',
        name: 'sre-group0',
        org_id: '000102',
        updated_at: '2023-02-28T12:35:20.071Z'
    },
    {
        created_at: '2023-02-28T12:35:20.071Z',
        host_ids: [
            'bA6deCFc19564430AB814bf8F70E8cEf'
        ],
        id: 'bA6deCFc19564430AB814bf8F70E8cEf',
        name: 'sre-group1',
        org_id: '000102',
        updated_at: '2023-02-28T12:35:20.071Z'
    },
    {
        created_at: '2023-02-28T12:35:20.071Z',
        host_ids: [
            'bA6deCFc19564430AB814bf8F70E8cEf'
        ],
        id: 'bA6deCFc19564430AB814bf8F70E8cEf',
        name: 'sre-group2',
        org_id: '000102',
        updated_at: '2023-02-28T12:35:20.071Z'
    },
    {
        created_at: '2023-02-28T12:35:20.071Z',
        host_ids: [
            'bA6deCFc19564430AB814bf8F70E8cEf'
        ],
        id: 'bA6deCFc19564430AB814bf8F70E8cEf',
        name: 'sre-group3',
        org_id: '000102',
        updated_at: '2023-02-28T12:35:20.071Z'
    }
];

//receive the array of selected groups and return chips based on the name of selected groups
export const buildHostGroupChips = (selectedGroups = []) => {
    //we use new Set to make sure that chips are unique
    const uniqueGroups = [...new Set(selectedGroups)];
    const chips = uniqueGroups?.map((group) => ({ name: group, value: group }));
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
    //currently mockApiResponse is replacing a proper API response
    //buildHostGroupsValues build an array of objects to populate dropdown
    const buildHostGroupsValues = mockApiResponse.reduce((acc, group) => {
        acc.push({ label: group.name, value: group.name });
        return acc;
    }, []);
    //selected are the groups we selected
    const [selected, setSelected] = useState([]);
    //host group values are all of the host group values available to the user
    const [hostGroupValue, setHostGroupValue] = useState(buildHostGroupsValues);

    const onHostGroupsChange = (event, selection) => {
        return setSelected(selected => [...selected, selection].flat(1));
    };

    const hostGroupsLoaded = useSelector(({ entities }) => entities?.groups);
    useEffect(() => {
        setHostGroupValue(hostGroupsLoaded);
    }, []);
    const chips = useMemo(() => buildHostGroupChips(selected), [selected]);
    /*
   const dispatch = useDispatch();
   useEffect(() => {
        dispatch(fetchGroups(apiParams));
    }, []); */

    //hostGroupConfig is a config that we use in EntityTableToolbar.js
    const hostGroupConfig = useMemo(() => ({
        label: 'Group',
        value: 'group-host-filter',
        type: 'checkbox',
        filterValues: {
            onChange: (event, value) => {
                onHostGroupsChange(event, value);
            },
            selected,
            items: buildHostGroupsValues
        }
    }), [selected, hostGroupValue]);

    return [chips, hostGroupConfig, selected, setHostGroupValue];
};

export default useGroupFilter;
