import React from 'react';
import { Icon } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { NOT_AVAILABLE } from '../../CellValue';
import { System } from '../../../hooks/useSystemsQuery';

export type HostStalenessStatus =
  | 'Fresh'
  | 'Stale'
  | 'Stale warning'
  | typeof NOT_AVAILABLE;

export const getHostStalenessStatus = (
  system: Pick<
    System,
    'stale_timestamp' | 'stale_warning_timestamp' | 'culled_timestamp'
  >,
  now: Date = new Date(),
): HostStalenessStatus => {
  const { stale_timestamp, stale_warning_timestamp, culled_timestamp } = system;

  if (!stale_timestamp) {
    return NOT_AVAILABLE;
  }

  const nowMs = now.getTime();
  const staleMs = new Date(stale_timestamp).getTime();

  if (nowMs < staleMs) {
    return 'Fresh';
  }

  if (stale_warning_timestamp) {
    const staleWarningMs = new Date(stale_warning_timestamp).getTime();
    if (nowMs < staleWarningMs) {
      return 'Stale';
    }
  } else {
    return 'Stale';
  }

  if (culled_timestamp) {
    const culledMs = new Date(culled_timestamp).getTime();
    if (nowMs < culledMs) {
      return 'Stale warning';
    }
  } else {
    return 'Stale warning';
  }

  return NOT_AVAILABLE;
};

interface StatusProps {
  system: System;
}

const Status = ({ system }: StatusProps) => {
  const status = getHostStalenessStatus(system);

  if (status === 'Stale') {
    return (
      <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
        <Icon status="warning" className="pf-v6-u-mr-xs">
          <ExclamationTriangleIcon />
        </Icon>
        <span className="pf-v6-u-text-color-status-warning pf-v6-u-font-weight-bold">
          Stale
        </span>
      </span>
    );
  }

  if (status === 'Stale warning') {
    return (
      <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
        <Icon status="danger" className="pf-v6-u-mr-xs">
          <ExclamationCircleIcon />
        </Icon>
        <span className="pf-v6-u-text-color-status-danger pf-v6-u-font-weight-bold">
          Stale warning
        </span>
      </span>
    );
  }

  return status;
};

export default Status;
