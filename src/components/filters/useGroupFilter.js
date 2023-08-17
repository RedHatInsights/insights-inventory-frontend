/* eslint-disable camelcase */
import union from 'lodash/union';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import { HOST_GROUP_CHIP } from '../../Utilities/index';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { getGroups } from '../InventoryGroups/utils/api';

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
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState([]);

  const onHostGroupsChange = useCallback((event, selection, item) => {
    setSelected(union(selection, item));
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const firstRequest = !ignore
        ? await getGroups(undefined, { page: 1, per_page: 1 })
        : { total: 0 };
      const groups = !ignore
        ? await fetchBatched(getGroups, firstRequest.total)
        : [];
      !ignore && setGroups(groups.flatMap(({ results }) => results));
    };

    let ignore = false;

    if (groupsEnabled) {
      fetchOptions();
    }

    return () => {
      ignore = true;
    };
  }, [groupsEnabled]);

  const chips = useMemo(() => buildHostGroupChips(selected), [selected]);

  // hostGroupConfig is used in EntityTableToolbar.js
  const hostGroupConfig = useMemo(
    () => ({
      label: 'Group',
      value: 'group-host-filter',
      type: 'checkbox',
      filterValues: {
        onChange: (event, value, item) => {
          onHostGroupsChange(event, value, item);
        },
        value: selected,
        items: groups.reduce((acc, { name }) => {
          acc.push({ label: name, value: name });
          return acc;
        }, []),
      },
    }),
    [groups, selected]
  );

  const setSelectedValues = (currentValue = []) => {
    setSelected(currentValue);
  };

  return [hostGroupConfig, chips, selected, setSelectedValues];
};

export default useGroupFilter;
