import React from 'react';
import { Link } from 'react-router-dom';
import { NOT_AVAILABLE } from '../../../constants';

export function buildSystemLink(
  appName: string,
  systemId: string,
  search = '',
): string {
  const query = search.startsWith('?') ? search.slice(1) : search;
  return `/insights/${appName}/systems/${systemId}${query ? `?${query}` : ''}`;
}

interface AppDataCountProps {
  count: unknown;
  /** When false, renders the count as plain text (no link). Defaults to true. */
  linked?: boolean;
  /** Explicit link target; overrides appName/systemId/search when linked. */
  to?: string;
  systemId?: string | null;
  appName?: string;
  search?: string;
}

const AppDataCount = ({
  count,
  linked = true,
  to,
  systemId,
  appName,
  search = '',
}: AppDataCountProps) => {
  if (typeof count !== 'number') {
    return NOT_AVAILABLE;
  }

  if (!linked) {
    return count;
  }

  if (count === 0) {
    return 0;
  }

  const linkTo =
    to ??
    (appName && systemId
      ? buildSystemLink(appName, systemId, search)
      : undefined);

  if (!linkTo) {
    return NOT_AVAILABLE;
  }

  return <Link to={linkTo}>{count}</Link>;
};

export default AppDataCount;
