import type { ApiHostGetHostListParams } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import type { LastSeenCustomRange } from '../DataViewFiltersContext';
import { resolveLastSeenBounds, type LastSeenKey } from '../constants';

/**
 * Maps toolbar last-seen key (+ in-memory custom range) to host list API params.
 *
 *  @param lastSeen            - Selected option key from the Last seen filter, or empty when cleared.
 *  @param lastSeenCustomRange - Start/end ISO strings when `custom` is selected;
 *  @returns                   `lastCheckInStart` / `lastCheckInEnd` fragment, or `null` when no effective range.
 */
export const lastSeenKeysToApiParams = (
  lastSeen: LastSeenKey | '',
  lastSeenCustomRange: LastSeenCustomRange,
): Pick<
  ApiHostGetHostListParams,
  'lastCheckInStart' | 'lastCheckInEnd'
> | null => {
  if (!lastSeen) {
    return null;
  }

  if (lastSeen === 'custom') {
    const start = lastSeenCustomRange?.start;
    const end = lastSeenCustomRange?.end;
    if (!start || !end) {
      return null;
    }
    return { lastCheckInStart: start, lastCheckInEnd: end };
  }

  const { start, end } = resolveLastSeenBounds(lastSeen);
  if (start === undefined && end === undefined) {
    return null;
  }
  return {
    ...(start !== undefined && { lastCheckInStart: start }),
    ...(end !== undefined && { lastCheckInEnd: end }),
  };
};
