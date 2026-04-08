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

/** Nested `filter.system_profile.operating_system` fragment for host list API */
export type OperatingSystemProfileFilter = Record<
  string,
  { version: { eq: string[] } }
>;

export const toOsToken = (os: string, version: string) => `${os}:${version}`;
export const fromOsToken = (token: string) => {
  const [os, version] = token.split(':', 2);
  return { os, version };
};

/**
 * Maps one `OperatingSystemSelectGroup` to `${osName}:${major.minor}` tokens stored in toolbar filter state.
 *
 *  @param group - One major-version group from the OS filter (`value` is the OS name; each item is `major.minor`)
 *  @returns     Token strings such as `RHEL:9.0`, one per item in the group
 */
export const buildOsFilterTokens = (
  group: OperatingSystemSelectGroup,
): string[] => group.items.map((item) => toOsToken(group.value, item.value));

/**
 * Maps `${osName}:${major.minor}` tokens to `filter.system_profile.operating_system` for the host list API.
 *
 *  @param tokens - Toolbar Filter selection (e.g. `RHEL:9.0`), or undefined
 *  @returns      Profile Filter or undefined when there is nothing to filter
 */
export const buildOperatingSystemProfileFilter = (
  tokens: string[] | undefined,
): OperatingSystemProfileFilter | undefined => {
  if (!tokens?.length) {
    return undefined;
  }

  const byOs: Record<string, string[]> = {};
  for (const token of tokens) {
    const { os, version } = fromOsToken(token);
    if (!os || !version) {
      continue;
    }
    if (!byOs[os]) {
      byOs[os] = [];
    }
    byOs[os].push(version);
  }

  const entries = Object.entries(byOs).map(([os, versions]) => [
    os,
    { version: { eq: [...new Set(versions)] } },
  ]);

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries);
};

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
