/* eslint-disable camelcase */
import React, { useEffect, useMemo, useState } from 'react';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import { HOST_GROUP_CHIP } from '../../Utilities/index';
import { getGroups } from '../InventoryGroups/utils/api';
import SearchableGroupFilter from './SearchableGroupFilter';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

export const groupFilterState = { hostGroupFilter: null };
export const GROUP_FILTER = 'GROUP_FILTER';
export const groupFilterReducer = (_state, { type, payload }) => ({
  ...(type === GROUP_FILTER && {
    hostGroupFilter: payload,
  }),
});

export const buildHostGroupChips = (selectedGroups = []) => {
  const chips = [...selectedGroups]?.map((group) =>
    group === ''
      ? {
          name: 'No group',
          value: '',
        }
      : {
          name: group,
          value: group,
        }
  );
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

const REQUIRED_PERMISSIONS = [GENERAL_GROUPS_READ_PERMISSION];

const useGroupFilter = (showNoGroupOption = false) => {
  const { pageOffsetfetchBatched } = useFetchBatched();
  const [fetchedGroups, setFetchedGroups] = useState([]);
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);

  const { hasAccess } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS,
    true,
    false
  );

  useEffect(() => {
    const fetchOptions = async () => {
      if (!hasAccess) return;

      const firstRequest = !ignore
        ? await getGroups(undefined, { page: 1, per_page: 50 })
        : { total: 0 };

      const groups =
        !ignore && firstRequest.total > 50
          ? await pageOffsetfetchBatched(
              getGroups,
              firstRequest.total - 50,
              {},
              50,
              1
            )
          : [];

      if (firstRequest.total > 0) {
        groups.push(firstRequest);
      }

      !ignore && setFetchedGroups(groups.flatMap(({ results }) => results));
    };

    let ignore = false;

    fetchOptions();

    return () => {
      ignore = true;
    };
  }, [hasAccess]);

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
            showNoGroupOption={showNoGroupOption}
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
