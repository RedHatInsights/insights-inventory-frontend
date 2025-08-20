import React, { useMemo, useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

import { HOST_GROUP_CHIP } from '../../Utilities/index';
import SearchableGroupFilter from './SearchableGroupFilter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroups } from '../InventoryGroups/utils/api';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';

const PAGE_SIZE = 50;
const INPUT_DEBOUNCE_MS = 300;

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

/**
 * Fetches workspaces (host groups) with a search support and infinite pagination.
 *
 * Behavior:
 * - Captures the unfiltered total when debouncedTerm is empty to understand dataset size.
 * - Uses a debounced search term for server-side filtering via getGroups if the total results exceed two pages (PAGE_SIZE * 2).
 * - Exposes setSearchTerm which is debounced; when remote search is disabled it resets
 * the debounced term to initSearchQuery to avoid unnecessary server calls.
 *
 *  @param   {object}                 options
 *  @param   {string}                 [options.initSearchQuery] Initial query reflected when remote search is disabled.
 *  @param   {boolean}                [options.isKesselEnabled] When true, restricts to standard workspaces via type filter.
 *  @param   {boolean}                [options.hasAccess]       Enables the underlying query when true, otherwise the query is disabled.
 *  @param   {number}                 [options.debounceTime]    Debounce duration for remote search, in ms.
 *  @returns {object}                                           result
 *  @returns {Array<{name: string}>}                            result.groups Flattened list of loaded workspaces.
 *  @returns {(term: string) => void}                           result.setSearchTerm Debounced setter for the remote search term.
 *  @returns {() => void}                                       result.fetchNextPage Load the next page when available.
 *  @returns {boolean}                                          result.hasNextPage Whether there is another page to load.
 *  @returns {boolean}                                          result.isFetchingNextPage True while the next page is loading.
 *  @returns {boolean}                                          result.remoteSearchEnabled True when server-side search should be used (> 2 pages total).
 */
const useGroupsQueryWithFilter = ({
  hasAccess,
  initSearchQuery = '',
  isKesselEnabled = false,
  debounceTime = INPUT_DEBOUNCE_MS,
}) => {
  const [searchTerm, setSearchTerm] = useState(initSearchQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initSearchQuery);
  const [unfilteredTotal, setUnfilteredTotal] = useState(undefined);

  const remoteSearchEnabled = useMemo(() => {
    return (
      typeof unfilteredTotal === 'number' && unfilteredTotal > PAGE_SIZE * 2
    );
  }, [unfilteredTotal]);

  // Debounce the search term
  const setSearchTermDebounced = useMemo(
    () => debounce((term) => setDebouncedTerm(term), debounceTime),
    [debounceTime, setDebouncedTerm],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['groups', debouncedTerm, isKesselEnabled],
      queryFn: async ({ pageParam = 1 }) =>
        getGroups(
          {
            ...(remoteSearchEnabled ? { name: debouncedTerm } : {}),
            ...(isKesselEnabled ? { type: 'standard' } : {}),
          },
          {
            page: pageParam,
            per_page: PAGE_SIZE,
          },
        ),
      // When menu opens, ensure at least first page is fetched
      enabled: hasAccess,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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

  // Capture the total count for the unfiltered dataset (debouncedTerm === initSearchQuery)
  useEffect(() => {
    const firstPageTotal = data?.pages?.[0]?.total;
    if (
      debouncedTerm === initSearchQuery &&
      typeof firstPageTotal === 'number'
    ) {
      setUnfilteredTotal(firstPageTotal);
    }
  }, [debouncedTerm, data, initSearchQuery, setUnfilteredTotal]);

  // Auto-load subsequent pages if user is searching, to power full-text search
  useEffect(() => {
    if (!hasAccess) return;
    if (!searchTerm || remoteSearchEnabled) return; // Only manual fetch unless searching through local data
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasAccess,
    searchTerm,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    remoteSearchEnabled,
  ]);

  // Collect data from all pages and filter groups based on the search term if remote search is disabled
  const groups = useMemo(() => {
    const allData = data?.pages?.flatMap((p) => p?.results || []) || [];
    if (remoteSearchEnabled || !searchTerm) {
      return allData;
    }

    return allData.filter((group) =>
      String(group.name).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm, remoteSearchEnabled]);

  // Set the search term and debounce it if remote search is enabled
  const setSearchQuery = useMemo(() => {
    return (term) => {
      setSearchTerm(term);
      if (remoteSearchEnabled) {
        setSearchTermDebounced(term);
      }
    };
  }, [setSearchTerm, setSearchTermDebounced, remoteSearchEnabled]);

  return {
    groups,
    searchQuery: searchTerm,
    setSearchQuery,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    remoteSearchEnabled,
    isLoading,
  };
};

const useGroupFilter = (showNoGroupOption = false, isKesselEnabled = false) => {
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);

  const { hasAccess } = usePermissionsWithContext(
    [GENERAL_GROUPS_READ_PERMISSION],
    true,
    false,
  );

  const {
    groups,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    setSearchQuery,
    searchQuery,
    isLoading,
  } = useGroupsQueryWithFilter({
    isKesselEnabled,
    hasAccess,
    debounceTime: INPUT_DEBOUNCE_MS,
  });

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
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoading={isLoading}
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
