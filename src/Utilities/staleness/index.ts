/**
 * Staleness filter values - single source of truth.
 *
 * Lifecycle: Fresh (≤1 day) → Stale (1-7 days) → Stale Warning (7-30 days) → Deleted (>30 days)
 * Customer-configurable from 10min to 2 years.
 */

/** Base staleness values (for API params, default filters) */
export const STALENESS_VALUES = ['fresh', 'stale', 'stale_warning'] as const;

/** Staleness value type */
export type StalenessValue = (typeof STALENESS_VALUES)[number];

/** Staleness options with labels (for filter dropdowns) */
export const STALENESS_OPTIONS = [
  { label: 'Fresh', value: 'fresh' as StalenessValue },
  { label: 'Stale', value: 'stale' as StalenessValue },
  { label: 'Stale warning', value: 'stale_warning' as StalenessValue },
] as const;
