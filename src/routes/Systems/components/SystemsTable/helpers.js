import { getTags } from '../../../../api/hostInventoryApi';
import { getGroups } from '../../../../components/InventoryGroups/utils/api';
import { MAX_PER_PAGE } from './constants';

export const fetchTags = async () => {
  return await getTags();
};

export const osVersionSorter = (a, b) =>
  b.major === a.major ? b.minor - a.minor : b.major - a.major;

export const getOsSelectOptions = (osName, osData) => {
  if (!osData) return [];

  const osItems = osData
    .filter((item) => item.name === osName)
    .toSorted(osVersionSorter);
  const majors = [...new Set(osItems.map((item) => item.major))];

  return majors.map((major) => ({
    label: `${osName} ${major}`,
    value: `${osName}`,
    items: osItems
      .filter((item) => item.major === major)
      .map((item) => ({
        label: `${item.name} ${item.major}.${item.minor}`,
        value: `${item.major}.${item.minor}`,
      })),
  }));
};

export const getDateDaysAgo = (days) => {
  const today = new Date();
  const daysAgo = new Date();
  daysAgo.setDate(today.getDate() - days);
  return daysAgo.toISOString();
};

export const getLastSeenSelectOptions = () => {
  return [
    {
      label: 'Within the last 24 hours',
      value: {
        updatedEnd: getDateDaysAgo(0),
        updatedStart: getDateDaysAgo(1),
      },
    },
    {
      label: 'More than 1 day ago',
      value: { updatedEnd: getDateDaysAgo(1) },
    },
    {
      label: 'More than 7 days ago',
      value: { updatedEnd: getDateDaysAgo(7) },
    },
    {
      label: 'More than 15 days ago',
      value: { updatedEnd: getDateDaysAgo(15) },
    },
    {
      label: 'More than 30 days ago',
      value: { updatedEnd: getDateDaysAgo(30) },
    },
    {
      label: 'Custom',
      value: {},
    },
  ];
};

// TODO rework this with using tanstack query
export const getWorkspaceSelectOptions = async () => {
  const firstResponse = await getGroups(undefined, {
    page: 1,
    per_page: MAX_PER_PAGE,
  });
  const { total, results: firstPageResults } = firstResponse;

  if (total <= MAX_PER_PAGE) {
    return firstPageResults;
  }

  const remainingPages = Math.ceil((total - MAX_PER_PAGE) / MAX_PER_PAGE);
  const remainingPagePromises = Array.from(
    { length: remainingPages },
    (_, index) =>
      getGroups(undefined, { page: index + 2, per_page: MAX_PER_PAGE }),
  );

  const remainingResponses = await Promise.all(remainingPagePromises);

  const allResults = [
    ...firstPageResults,
    ...remainingResponses.flatMap((response) => response.results),
  ];

  return allResults;
};
