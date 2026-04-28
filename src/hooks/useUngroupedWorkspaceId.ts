import { useQuery } from '@tanstack/react-query';
import { getGroups } from '../components/InventoryGroups/utils/api';

/**
 * Resolves the Kessel "Ungrouped hosts" workspace id for GET /groups?group_type=ungrouped-hosts.
 * Use for GET /hosts?group_id=… instead of an empty string sentinel.
 *  @param enabled
 */
export function useUngroupedWorkspaceId(enabled: boolean) {
  return useQuery({
    queryKey: ['groups', 'ungrouped-hosts-workspace'],
    queryFn: async () => {
      const data = await getGroups(
        { type: 'ungrouped-hosts' },
        { page: 1, per_page: 10 },
      );
      const results = data?.results ?? [];
      const flagged = results.find(
        (g: { id?: string; ungrouped?: boolean }) => g.ungrouped === true,
      );
      if (flagged?.id) {
        return flagged.id;
      }
      if (results.length === 1 && results[0]?.id) {
        return results[0].id;
      }
      return undefined;
    },
    enabled,
  });
}
