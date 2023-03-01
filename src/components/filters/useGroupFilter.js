/* eslint-disable camelcase */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from '../../store/inventory-actions';
import { HOST_GROUP_CHIP } from '../../Utilities/index';

export const onHostGroupsChange = (event, selection) => {
    const newSelection = [...selection];
    return newSelection;
};

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
    const chips = selectedGroups?.map((group) => ({ name: group, value: group }));
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
    //we need to load all groups and then show their names
    const [selected, setSelected] = useState([]);
    const [hostGroupValue, setHostGroupValue] = useState([]);

    const dispatch = useDispatch();
    const hostGroupsLoaded = useSelector(({ entities }) => entities?.groups);
    useEffect(() => {
        setHostGroupValue(hostGroupsLoaded);
    }, []);

    const buildHostGroupsValues = mockApiResponse.reduce((acc, group) => {
        acc.push({ label: group.name, value: group.name });
        return acc;
    }, []);

    const chips = useMemo(() => buildHostGroupChips(selected), [selected, hostGroupsLoaded]);

    useEffect(() => {
        dispatch(fetchGroups(apiParams));
    }, []);

    const hostGroupConfig = useMemo(() => ({
        label: 'Group',
        value: 'host-groups-filter',
        type: 'checkbox',
        filterValues: {
            onChange: (event, value, clickedGroup) => {
                setSelected(onHostGroupsChange(event, value, clickedGroup));
            },
            selected,
            items: buildHostGroupsValues
        }
    }), [selected, hostGroupValue]);

    return [chips, hostGroupConfig, hostGroupValue, setHostGroupValue];
};

export default useGroupFilter;
