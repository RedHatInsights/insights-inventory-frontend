import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  INVENTORY_FETCH_BOOTC,
  INVENTORY_FETCH_EDGE,
  INVENTORY_PACKAGE_BASED_SYSTEMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
} from '../../../../Utilities/constants';
import type {
  HostQueryOutput,
  SystemProfileBootcStatusBooted,
} from '@redhat-cloud-services/host-inventory-client';
import { useQueries } from '@tanstack/react-query';
import { INITIAL_PAGE } from '../../constants';
import { System } from '../../../SystemsView/hooks/useSystemsQuery';

export type BootcSystem = System & {
  system_profile: {
    bootc_status: { booted: SystemProfileBootcStatusBooted };
  };
};

const PER_PAGE = 100;

/**
 * Runs the inventory queries needed for the Images view in parallel: bootc systems (paginated),
 * package-based system count, and edge (OSTree) system count.
 *
 *  @returns The result of `useQueries` — an array of three query results in order:
 *   `[bootcResults, packageBasedResults, edgeResults]`. Each has `data`, `isLoading`,
 *   `isError`, etc. Destructure and pass `data` (when loaded) to `useRows` or similar.
 */
export const useImageQueries = () => {
  const axios = useAxiosWithPlatformInterceptors();

  interface Pagination {
    per_page: number;
    page: number;
  }

  const fetchBootc = async (pagination: Pagination) => {
    return axios.get(
      `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&fields[system_profile]=bootc_status`,
      { params: { ...pagination } },
    ) as unknown as HostQueryOutput & { results: BootcSystem[] };
  };
  const fetchPackageBased = async () => {
    return axios.get(
      `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_PACKAGE_BASED_SYSTEMS}&per_page=1`,
    ) as unknown as HostQueryOutput;
  };
  const fetchEdge = async () => {
    return axios.get(
      `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_EDGE}&per_page=1`,
    ) as unknown as HostQueryOutput;
  };

  const queryResults = useQueries({
    queries: [
      {
        queryKey: ['bootc'],
        queryFn: async () => {
          const allResults = [];
          let page = INITIAL_PAGE;
          let hasMore = true;

          while (hasMore) {
            const { results } = await fetchBootc({
              per_page: PER_PAGE,
              page,
            });
            allResults.push(results);
            hasMore = results.length === PER_PAGE;
            page++;
          }

          return allResults.flat();
        },
      },
      {
        queryKey: ['packageBased'],
        queryFn: () => fetchPackageBased(),
      },
      { queryKey: ['edge'], queryFn: () => fetchEdge() },
    ],
  });

  return queryResults;
};

export default useImageQueries;
