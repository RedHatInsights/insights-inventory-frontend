import { useQuery } from '@tanstack/react-query';
import type {
  ActiveTag,
  ActiveTags,
} from '@redhat-cloud-services/host-inventory-client';
import { getTagList } from '../../../api/hostInventoryApiTyped';
import { INITIAL_PAGE, PER_PAGE_MAX } from '../../../constants';
import { STALENESS_VALUES } from '../../../Utilities/staleness';

const pageCoversTotal = (page: ActiveTags, collected: number): boolean => {
  if (page.results.length === 0) return true;
  const total = page.total ?? collected;
  const perPage = page.per_page || PER_PAGE_MAX;
  const pageNumber = page.page || INITIAL_PAGE;
  return perPage * pageNumber >= total;
};

/** Every tag row for the account, across all pages of GET /tags. */
export const fetchAccountTags = async (): Promise<ActiveTag[]> => {
  const tags: ActiveTag[] = [];
  let page = INITIAL_PAGE;

  for (;;) {
    const response = await getTagList({
      page,
      perPage: PER_PAGE_MAX,
      orderBy: 'tag',
      orderHow: 'ASC',
      staleness: [...STALENESS_VALUES],
    });
    const batch = response.results ?? [];
    tags.push(...batch);

    const pageInfo: ActiveTags = { ...response, results: batch };
    if (pageCoversTotal(pageInfo, tags.length)) return tags;

    const nextPage = (response.page || page) + 1;
    if (nextPage <= page) return tags;
    page = nextPage;
  }
};

export const useAccountTagCatalog = () =>
  useQuery({
    queryKey: ['account-tag-catalog'],
    queryFn: fetchAccountTags,
    refetchOnWindowFocus: false,
  });
