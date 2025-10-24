import { getTags } from '../../../../api/hostInventoryApi';

export const stringToId = (string) =>
  string.split(/\s+/).join('-').toLowerCase();
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
