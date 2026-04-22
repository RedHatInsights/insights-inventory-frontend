import moment from 'moment';

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
