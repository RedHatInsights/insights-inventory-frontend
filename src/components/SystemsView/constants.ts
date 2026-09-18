import moment from 'moment';
import type { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

/** URL query key / DataView `filterId` for workspace filter (`GET /hosts?group_id=`). */
export const SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM = 'group_id';

/** Display text for the ungrouped hosts workspace in filters and chips. */
export const UNGROUPED_HOSTS_LABEL = 'Ungrouped hosts';

export const FILTER_DROPDOWN_WIDTH = '300px';

export const LOADER_ID = 'loader';

export const LAST_SEEN_KEYS = [
  'last24',
  '24more',
  '7more',
  '15more',
  '30more',
  'custom',
] as const;

export type LastSeenKey = (typeof LAST_SEEN_KEYS)[number];

const LAST_SEEN_KEY_SET = new Set<string>(LAST_SEEN_KEYS);

export const isLastSeenKey = (key: string): key is LastSeenKey =>
  LAST_SEEN_KEY_SET.has(key);

/**
 * Normalizes URL/state (string, or invalid) to a single valid key or cleared.
 *
 *  @param value - Raw `last_seen` from filters or URL parsing.
 *  @returns     A valid last-seen key, or empty string when unset/invalid.
 */
export const normalizeLastSeenFilterValue = (
  value: unknown,
): LastSeenKey | '' => {
  return typeof value === 'string' && isLastSeenKey(value) ? value : '';
};

/**
 * Fresh moment() per call — use when building API params, not at module load.
 *
 *  @param key - Preset or `custom` (custom returns empty bounds; use separate state for dates).
 *  @returns   ISO bounds for `last_seen` filter, with optional `start` and `end`.
 */
export const resolveLastSeenBounds = (
  key: LastSeenKey,
): { start?: string; end?: string } => {
  switch (key) {
    case 'last24':
      return {
        start: moment().subtract(1, 'days').toISOString(),
        end: moment().toISOString(),
      };
    case '24more':
      return { end: moment().subtract(1, 'days').toISOString() };
    case '7more':
      return { end: moment().subtract(7, 'days').toISOString() };
    case '15more':
      return { end: moment().subtract(15, 'days').toISOString() };
    case '30more':
      return { end: moment().subtract(30, 'days').toISOString() };
    case 'custom':
      return {};
  }
};

/**
 * Fresh moment() per call — inverse of resolveLastSeenBounds.
 *
 * Saved view configs persist only the concrete `last_check_in` dates, not the
 * original preset key, so restoring the UI requires classifying those dates back
 * to a key to repaint the Last seen dropdown.
 *
 *  @param start - Saved `last_check_in_start`, if any.
 *  @param end   - Saved `last_check_in_end`, if any.
 *  @returns     A `last_seen` key (single bound → closest preset by age), or empty when none.
 */
export const resolveLastSeenKeyFromBounds = (
  start: string | undefined,
  end: string | undefined,
): LastSeenKey | '' => {
  if (!start && !end) return '';

  // Custom ranges come from the date pickers, which snap to day boundaries
  // (start → startOf day, end → endOf day). Presets use arbitrary now-based times,
  // so a day-aligned bound on either side is a custom selection.
  const isStartAligned =
    start !== undefined && moment(start).startOf('day').toISOString() === start;
  const isEndAligned =
    end !== undefined && moment(end).endOf('day').toISOString() === end;

  if (start && end) {
    return isStartAligned && isEndAligned ? 'custom' : 'last24';
  }

  if (isStartAligned || isEndAligned) {
    return 'custom';
  }

  const bound = (end ?? start) as string;
  const daysAgo = moment().diff(moment(bound), 'days');
  const presets: { key: LastSeenKey; days: number }[] = [
    { key: '24more', days: 1 },
    { key: '7more', days: 7 },
    { key: '15more', days: 15 },
    { key: '30more', days: 30 },
  ];
  return presets.reduce((closest, preset) =>
    Math.abs(preset.days - daysAgo) < Math.abs(closest.days - daysAgo)
      ? preset
      : closest,
  ).key;
};

export const LAST_SEEN_OPTIONS: { label: string; key: LastSeenKey }[] = [
  { label: 'Within the last 24 hours', key: 'last24' },
  { label: 'More than 1 day ago', key: '24more' },
  { label: 'More than 7 days ago', key: '7more' },
  { label: 'More than 15 days ago', key: '15more' },
  { label: 'More than 30 days ago', key: '30more' },
  { label: 'Custom', key: 'custom' },
];

export const SORT_URL_PARAM = 'sort';

export const SORT_DIR_URL_PARAM = 'sort_dir';

/**
 * TODO(host-inventory-client): replace with
 * ApiHostViewsGetHostViewsOrderByEnum.VulnerabilityimportantCves once the client
 * enum supports this field.
 */
export const IMPORTANT_CVES_SORT_KEY = 'vulnerability:important_cves' as
  | ApiHostViewsGetHostViewsOrderByEnum
  | 'vulnerability:important_cves';

/**
 * TODO(host-inventory-client): replace with
 * ApiHostViewsGetHostViewsOrderByEnum.VulnerabilitycvesWithSecurityRules once the
 * client enum supports this field.
 */
export const CVES_WITH_SECURITY_RULES_SORT_KEY =
  'vulnerability:cves_with_security_rules' as
    | ApiHostViewsGetHostViewsOrderByEnum
    | 'vulnerability:cves_with_security_rules';

/**
 * TODO(host-inventory-client): replace with
 * ApiHostViewsGetHostViewsOrderByEnum.VulnerabilitycvesWithKnownExploits once the
 * client enum supports this field.
 */
export const CVES_WITH_KNOWN_EXPLOITS_SORT_KEY =
  'vulnerability:cves_with_known_exploits' as
    | ApiHostViewsGetHostViewsOrderByEnum
    | 'vulnerability:cves_with_known_exploits';

const ADVISORY_AVAILABLE = 'advisory_available=true';
const RULE_PRESENCE = 'rule_presence=true';
const KNOWN_EXPLOIT = 'known_exploit=true';

/** Vulnerability system link query strings keyed by column concern. */
export const VULNERABILITY_LINK_SEARCH = {
  totalCves: ADVISORY_AVAILABLE,
  criticalCves: 'impact=7',
  importantCves: 'impact=5',
  cvesWithSecurityRules: `${ADVISORY_AVAILABLE}&${RULE_PRESENCE}`,
  cvesWithKnownExploits: `${ADVISORY_AVAILABLE}&${KNOWN_EXPLOIT}`,
} as const;

export const EMPTY_SERVICES: string[] = [];
