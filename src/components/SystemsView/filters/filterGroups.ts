import type { ConsumerAppName } from '../types';

/**
 * Heading shown above each service's filters in the attribute dropdown.
 */
export const APP_GROUP_LABEL: Record<ConsumerAppName, string> = {
  inventory: 'Inventory',
  advisor: 'Advisor',
  vulnerability: 'Vulnerability',
  compliance: 'Compliance',
  content: 'Content',
  malware: 'Malware',
  // No filter binds these two services, but they are included for completeness.
  remediations: 'Remediations',
  tag: 'Tags',
};

/**
 * Order the service groups appear in. Inventory leads because it is the
 * table's own data; the app-data services follow. Services missing here fall
 * to the end, so adding one to `ConsumerAppName` cannot drop its filters.
 */
export const APP_GROUP_ORDER: readonly ConsumerAppName[] = [
  'inventory',
  'advisor',
  'vulnerability',
  'compliance',
  'content',
  'malware',
];

/**
 * Splits filters into service groups, in `APP_GROUP_ORDER`, preserving each
 * service's own filter order. Groups with no filters are dropped, so a view
 * that binds only inventory filters shows no headings for anything else.
 *
 *  @param items - Filters to group, each carrying its `appName`
 *  @returns     One entry per non-empty service group
 */
export const groupFiltersByApp = <T extends { appName: ConsumerAppName }>(
  items: readonly T[],
): { appName: ConsumerAppName; label: string; items: T[] }[] => {
  const byApp = new Map<ConsumerAppName, T[]>();
  for (const item of items) {
    const group = byApp.get(item.appName);
    if (group) {
      group.push(item);
    } else {
      byApp.set(item.appName, [item]);
    }
  }

  const ordered = [
    ...APP_GROUP_ORDER.filter((app) => byApp.has(app)),
    ...[...byApp.keys()].filter((app) => !APP_GROUP_ORDER.includes(app)),
  ];

  return ordered.map((appName) => ({
    appName,
    label: APP_GROUP_LABEL[appName] ?? appName,
    items: byApp.get(appName) as T[],
  }));
};

/**
 * Converts `groupFiltersByApp` output into the `groups` prop shape that
 * `GroupedDataViewFilters` (and the future upstream `DataViewFilters`) accepts.
 */
export const toDataViewFilterGroups = <
  T extends { appName: ConsumerAppName; filterId: string },
>(
  items: readonly T[],
): { id: string; label: string; filterIds: string[] }[] =>
  groupFiltersByApp(items).map((g) => ({
    id: g.appName,
    label: g.label,
    filterIds: g.items.map((i) => i.filterId),
  }));
