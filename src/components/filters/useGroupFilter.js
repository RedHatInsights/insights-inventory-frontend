import React, { useMemo, useState, useEffect } from 'react';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

import { HOST_GROUP_CHIP } from '../../Utilities/index';
import SearchableGroupFilter from './SearchableGroupFilter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroups } from '../InventoryGroups/utils/api';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';

const PAGE_SIZE = 50;

export const groupFilterState = { hostGroupFilter: null };
export const GROUP_FILTER = 'GROUP_FILTER';
export const groupFilterReducer = (_state, { type, payload }) => ({
  ...(type === GROUP_FILTER && {
    hostGroupFilter: payload,
  }),
});

export const buildHostGroupChips = (
  selectedGroups = [],
  isKesselEnabled = false,
) => {
  const chips = [...selectedGroups]?.map((group) =>
    group === ''
      ? {
          name: isKesselEnabled ? 'Ungrouped hosts' : 'No workspace',
          value: '',
        }
      : {
          name: group,
          value: group,
        },
  );
  return chips?.length > 0
    ? [
        {
          category: 'Workspace',
          type: HOST_GROUP_CHIP,
          chips,
        },
      ]
    : [];
};

const useGroupFilter = (showNoGroupOption = false, isKesselEnabled = false) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);

  const { hasAccess } = usePermissionsWithContext(
    [GENERAL_GROUPS_READ_PERMISSION],
    true,
    false,
  );

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['groups', { kessel: isKesselEnabled }],
      queryFn: async ({ pageParam = 1 }) =>
        getGroups(isKesselEnabled ? { type: 'standard' } : {}, {
          page: pageParam,
          per_page: PAGE_SIZE,
        }),
      // When menu opens, ensure at least first page is fetched
      enabled: hasAccess,
      getNextPageParam: (lastPage, pages) => {
        const currentCount = pages.reduce(
          (sum, p) => sum + (p?.results?.length || 0),
          0,
        );
        if (lastPage?.total && currentCount < lastPage.total) {
          return pages.length + 1;
        }
        return undefined;
      },
    });

  const groups = useMemo(
    () => data?.pages?.flatMap((p) => p?.results || []) || [],
    [data],
  );

  // Auto-load subsequent pages only while user is searching, to power full-text search
  useEffect(() => {
    if (!hasAccess) return;
    if (!inputValue) return; // avoid background loops when not searching
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasAccess, inputValue, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const chips = useMemo(
    () => buildHostGroupChips(selectedGroupNames, isKesselEnabled),
    [selectedGroupNames, isKesselEnabled],
  );

  return [
    {
      label: 'Workspace',
      value: 'group-host-filter',
      type: 'custom',
      filterValues: {
        children: (
          <SearchableGroupFilter
            inputValue={inputValue}
            setInputValue={setInputValue}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            groups={groups}
            selectedGroupNames={selectedGroupNames}
            setSelectedGroupNames={setSelectedGroupNames}
            showNoGroupOption={showNoGroupOption}
            isKesselEnabled={isKesselEnabled}
          />
        ),
      },
    },
    chips,
    selectedGroupNames,
    (groupNames) => setSelectedGroupNames(groupNames || []),
  ];
};

export default useGroupFilter;
