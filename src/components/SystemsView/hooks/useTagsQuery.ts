import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getTagList } from '../../../api/hostInventoryApiTyped';
import { INITIAL_PAGE, PER_PAGE } from '../../../constants';
import { STALENESS_VALUES } from '../../../Utilities/staleness';

interface FetchTagsParams {
  search: string;
  page: number;
  perPage: number;
}

const fetchTags = async ({ search, page, perPage }: FetchTagsParams) => {
  const { results, total } = await getTagList({
    page,
    perPage,
    orderBy: 'tag',
    orderHow: 'ASC',
    staleness: [...STALENESS_VALUES],
    ...(search && { search }),
  });

  return { results: results ?? [], total };
};

interface UseTagsQueryParams {
  search: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

export const useTagsQuery = ({
  search,
  page = INITIAL_PAGE,
  perPage = PER_PAGE,
  enabled = true,
}: UseTagsQueryParams) => {
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['tags', search, page, perPage],
    queryFn: async () => await fetchTags({ search, page, perPage }),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
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
