/* eslint-disable camelcase */
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import { HOST_GROUP_CHIP } from '../../Utilities/index';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { getGroups } from '../InventoryGroups/utils/api';
import SearchableGroupFilter from './SearchableGroupFilter';

export const groupFilterState = { hostGroupFilter: null };
export const GROUP_FILTER = 'GROUP_FILTER';
export const groupFilterReducer = (_state, { type, payload }) => ({
  ...(type === GROUP_FILTER && {
    hostGroupFilter: payload,
  }),
});

export const buildHostGroupChips = (selectedGroups = []) => {
  const chips = [...selectedGroups]?.map((group) => ({
    name: group,
    value: group,
  }));
  return chips?.length > 0
    ? [
        {
          category: 'Group',
          type: HOST_GROUP_CHIP,
          chips,
        },
      ]
    : [];
};

const useGroupFilter = () => {
  const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');
  const { fetchBatched } = useFetchBatched();
  const [fetchedGroups, setFetchedGroups] = useState([]);
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const firstRequest = !ignore
        ? await getGroups(undefined, { page: 1, per_page: 1 })
        : { total: 0 };
      const groups = !ignore
        ? await fetchBatched(getGroups, firstRequest.total)
        : [];
      !ignore && setFetchedGroups(groups.flatMap(({ results }) => results));
    };

    let ignore = false;

    if (groupsEnabled) {
      fetchOptions();
    }

    return () => {
      ignore = true;
    };
  }, [groupsEnabled]);

  const chips = useMemo(
    () => buildHostGroupChips(selectedGroupNames),
    [selectedGroupNames]
  );

  // hostGroupConfig is used in EntityTableToolbar.js
  const hostGroupConfig = useMemo(
    () => ({
      label: 'Group',
      value: 'group-host-filter',
      type: 'custom',
      filterValues: {
        children: (
          <SearchableGroupFilter
            initialGroups={fetchedGroups}
            selectedGroupNames={selectedGroupNames}
            setSelectedGroupNames={setSelectedGroupNames}
          />
        ),
      },
    }),
    [fetchedGroups, selectedGroupNames]
  );

  return [
    hostGroupConfig,
    chips,
    selectedGroupNames,
    (groupNames) => setSelectedGroupNames(groupNames || []),
  ];
};

export default useGroupFilter;
