import type { SystemProfileOperatingSystemOut } from '@redhat-cloud-services/host-inventory-client';

export interface OperatingSystemVersionRow {
  name: string;
  major: number;
  minor: number;
}

export interface OperatingSystemSelectItem {
  label: string;
  value: string;
}

export interface OperatingSystemSelectGroup {
  label: string;
  value: string;
  items: OperatingSystemSelectItem[];
}

export const mapOperatingSystemApiResultsToVersionRows = (
  results: SystemProfileOperatingSystemOut['results'] | undefined,
): OperatingSystemVersionRow[] => {
  if (!results?.length) {
    return [];
  }

  return results.flatMap((row) => {
    const v = row.value;
    if (
      v?.name === undefined ||
      typeof v.major !== 'number' ||
      typeof v.minor !== 'number'
    ) {
      return [];
    }

    return [{ name: v.name, major: v.major, minor: v.minor }];
  });
};

export const buildOperatingSystemSelectGroups = (
  osData: OperatingSystemVersionRow[],
): OperatingSystemSelectGroup[] => [
  ...getOsSelectOptions('CentOS Linux', osData),
  ...getOsSelectOptions('RHEL', osData),
];

export const osVersionSorter = (
  a: OperatingSystemVersionRow,
  b: OperatingSystemVersionRow,
) => (b.major === a.major ? b.minor - a.minor : b.major - a.major);

export const getOsSelectOptions = (
  osName: string,
  osData: OperatingSystemVersionRow[] | undefined | null,
): OperatingSystemSelectGroup[] => {
  if (!osData) return [];

  const osItems = osData
    .filter((item) => item.name === osName)
    .sort(osVersionSorter);
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
