import { useQuery } from '@tanstack/react-query';
import { getOperatingSystems } from '../../../api/hostInventoryApiTyped';

interface UseOperatingSystemsQueryParams {
  enabled?: boolean;
}

export const useOperatingSystemsQuery = ({
  enabled = true,
}: UseOperatingSystemsQueryParams = {}) => {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['operatingSystems'],
    queryFn: async () => await getOperatingSystems(),
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    data: data?.results,
    total: data?.total,
    isLoading,
    isFetching,
    isError,
    error,
  };
};
