import { Spinner } from '@patternfly/react-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { getGroupsByIds } from '../components/InventoryGroups/utils/api';
import { UNGROUPED_HOSTS_LABEL } from '../components/SystemsView/constants';

type InfiniteGroupsData = {
  pages?: Array<{
    results?: Array<{ id?: string; name?: string }>;
  }>;
};

/**
 * Merge id→name from every groups infinite-query cache (Inventory toolbar + SystemsView picker).
 *  @param queryClient
 */
function collectNamesFromGroupListCaches(
  queryClient: ReturnType<typeof useQueryClient>,
): Record<string, string> {
  const map: Record<string, string> = {};
  queryClient
    .getQueryCache()
    .findAll({
      predicate: (q) => {
        const key = q.queryKey;
        return Array.isArray(key) && key[0] === 'groups';
      },
    })
    .forEach((query) => {
      const data = query.state.data as InfiniteGroupsData | undefined;
      data?.pages?.forEach((page) => {
        page.results?.forEach((g) => {
          if (g?.id && g.name !== undefined) {
            map[g.id] = g.name;
          }
        });
      });
    });
  return map;
}

export type HostGroupChipNodeProps = {
  id: string;
  names: Record<string, string>;
  isFetching: boolean;
  ids: string[];
  /** IDs included in the active by-id fetch (spinner only while these resolve). */
  pendingLabelFetchIds: string[];
};

/**
 * Workspace / host-group chip label: resolved name, loading spinner, or raw id.
 *  @param root0
 *  @param root0.id
 *  @param root0.names
 *  @param root0.isFetching
 *  @param root0.ids
 *  @param root0.pendingLabelFetchIds
 */
export function HostGroupChipNode({
  id,
  names,
  isFetching,
  ids,
  pendingLabelFetchIds,
}: HostGroupChipNodeProps) {
  if (!id) {
    return <>{UNGROUPED_HOSTS_LABEL}</>;
  }

  const name = names[id];
  if (name) {
    return <>{name}</>;
  }

  if (ids.includes(id) && isFetching && pendingLabelFetchIds.includes(id)) {
    return (
      <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
        <Spinner
          size="sm"
          className="pf-v6-u-mr-sm"
          aria-label="Loading workspace name"
        />
        <span className="pf-v6-u-screen-reader">{id}</span>
      </span>
    );
  }

  return <>{id}</>;
}

/**
 * Resolves host group / workspace IDs to display names. Uses a one-time read of
 * any in-memory `['groups', ...]` infinite-query cache, then fetches remaining IDs.
 *  @param groupIds
 */
export function useHostGroupNames(groupIds: string[] | undefined) {
  const queryClient = useQueryClient();

  const uniqueIds = useMemo(
    () => [...new Set((groupIds ?? []).filter(Boolean))].sort(),
    [groupIds],
  );

  const namesFromGroupQueries = useMemo(
    () => collectNamesFromGroupListCaches(queryClient),
    [queryClient, uniqueIds],
  );

  const idsNeedingFetch = useMemo(
    () => uniqueIds.filter((id) => !namesFromGroupQueries[id]),
    [uniqueIds, namesFromGroupQueries],
  );

  const { data: fetchedGroups = [], isFetching } = useQuery({
    queryKey: ['workspace-chip-display-names', idsNeedingFetch],
    queryFn: async () => {
      if (idsNeedingFetch.length === 0) return [];
      const res = await getGroupsByIds(idsNeedingFetch);
      return res.results ?? [];
    },
    enabled: idsNeedingFetch.length > 0,
    staleTime: 60_000,
  });

  const namesFromApi = useMemo(() => {
    const map: Record<string, string> = {};
    fetchedGroups.forEach((g: { id?: string; name?: string }) => {
      if (g.id && g.name !== undefined) map[g.id] = g.name;
    });
    return map;
  }, [fetchedGroups]);

  const names = useMemo(
    () => ({ ...namesFromGroupQueries, ...namesFromApi }),
    [namesFromGroupQueries, namesFromApi],
  );

  return {
    names,
    isFetching,
    ids: uniqueIds,
    pendingLabelFetchIds: idsNeedingFetch,
  };
}
