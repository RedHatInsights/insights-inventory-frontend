import React, { useMemo, useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';

import { HOST_GROUP_CHIP } from '../../Utilities/index';
import SearchableGroupFilter from './SearchableGroupFilter';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroups } from '../InventoryGroups/utils/api';
import { GENERAL_GROUPS_READ_PERMISSION } from '../../constants';
import { useUngroupedWorkspaceId } from '../../hooks/useUngroupedWorkspaceId';
import { UNGROUPED_HOSTS_LABEL } from '../SystemsView/constants';

const PAGE_SIZE = 10;
const INPUT_DEBOUNCE_MS = 300;

export const groupFilterState = { hostGroupFilter: null };
export const GROUP_FILTER = 'GROUP_FILTER';
export const groupFilterReducer = (_state, { type, payload }) => ({
  ...(type === GROUP_FILTER && {
    hostGroupFilter: payload,
  }),
});

/**
 * Toolbar chips: `name` is shown in the UI; `value` is workspace id (chip delete / keys).
 *  @param selectedGroups
 */

export const buildHostGroupChips = (selectedGroups = []) => {
  const chips = selectedGroups.map((group) => {
    if (typeof group === 'string') {
      const isUngrouped = group === '' || group === UNGROUPED_HOSTS_LABEL;
      return {
        name: isUngrouped ? UNGROUPED_HOSTS_LABEL : group,
        value: group,
      };
    }
    return {
      name: group.ungrouped ? UNGROUPED_HOSTS_LABEL : group.name,
      value: group.id,
    };
  });

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
 * - Exposes setSearchQuery which is debounced; when remote search is disabled it resets
 * the debounced term to initSearchQuery to avoid unnecessary server calls.
 *
 *  @param   {object}  options                   The options object.
 *  @param   {string}  [options.initSearchQuery] Initial query reflected when remote search is disabled.
 *  @param   {boolean} [options.hasAccess]       Enables the underlying query when true, otherwise the query is disabled.
 *  @param   {number}  [options.debounceTime]    Debounce duration for remote search, in ms.
 *  @returns {Array}                             result array of a single object with the following properties:
 *                                               result.groups {Array<{name: string}>} - Flattened list of loaded workspaces.
 *                                               result.setSearchQuery {function(string): void} - Debounced setter for the remote search term.
 *                                               result.fetchNextPage {function(): void} - Load the next page when available.
 *                                               result.hasNextPage {boolean} - Whether there is another page to load.
 *                                               result.isFetchingNextPage {boolean} - True while the next page is loading.
 *                                               result.remoteSearchEnabled {boolean} - True when server-side search should be used (> 2 pages total).
 */
const useGroupsQueryWithFilter = ({
  hasAccess,
  initSearchQuery = '',
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
      queryKey: ['groups', debouncedTerm],
      queryFn: async ({ pageParam = 1 }) =>
        getGroups(
          {
            ...(remoteSearchEnabled ? { name: debouncedTerm } : {}),
            ...{ type: 'standard' },
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

const useGroupFilter = (showNoGroupOption = true) => {
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);

  const { hasAccess } = useConditionalRBAC(
    [GENERAL_GROUPS_READ_PERMISSION],
    true,
    false,
  );

  const { data: ungroupedWorkspaceId } = useUngroupedWorkspaceId(
    hasAccess && showNoGroupOption,
  );

  const ungroupedWorkspace = useMemo(() => {
    if (!ungroupedWorkspaceId) {
      return null;
    }
    return {
      id: ungroupedWorkspaceId,
      name: UNGROUPED_HOSTS_LABEL,
      ungrouped: true,
    };
  }, [ungroupedWorkspaceId]);

  const {
    groups,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    setSearchQuery,
    searchQuery,
    isLoading,
  } = useGroupsQueryWithFilter({
    hasAccess,
    debounceTime: INPUT_DEBOUNCE_MS,
  });

  const chips = useMemo(
    () => buildHostGroupChips(selectedGroupNames),
    [selectedGroupNames],
  );

  const needsHostGroupResolution = useMemo(
    () =>
      selectedGroupNames.some((group) => {
        if (typeof group === 'string') {
          return true;
        }
        if (typeof group === 'object' && group !== null) {
          if (group.id === '') {
            return true;
          }
          if (
            group.ungrouped &&
            ungroupedWorkspace &&
            group.id !== ungroupedWorkspace.id
          ) {
            return true;
          }
        }
        return false;
      }),
    [selectedGroupNames, ungroupedWorkspace],
  );

  // URL/bookmark state uses group_name strings; resolve to { id, name } for dropdown selection.
  useEffect(() => {
    if (!needsHostGroupResolution) {
      return;
    }
    if (!groups.length && !ungroupedWorkspace) {
      return;
    }
    setSelectedGroupNames((prev) =>
      prev.map((group) => {
        if (typeof group === 'object' && group !== null) {
          if (group.ungrouped || group.id === '') {
            return ungroupedWorkspace ?? group;
          }
          return group;
        }
        if (group === '' || group === UNGROUPED_HOSTS_LABEL) {
          return (
            ungroupedWorkspace ?? { id: group, name: group, ungrouped: true }
          );
        }
        const match = groups.find((workspace) => workspace.name === group);
        return match
          ? { id: match.id, name: match.name }
          : { id: group, name: group };
      }),
    );
  }, [groups, ungroupedWorkspace, needsHostGroupResolution]);

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
            ungroupedWorkspace={ungroupedWorkspace}
            selectedGroupNames={selectedGroupNames}
            setSelectedGroupNames={setSelectedGroupNames}
            showNoGroupOption={showNoGroupOption}
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
