import React from 'react';
import { Icon } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import CellValue from '../../CellValue';
import { System } from '../../../hooks/useSystemsQuery';

export type HostStalenessStatus = 'Fresh' | 'Stale' | 'Stale warning';

export type StatusTimestamps = Pick<
  System,
  'stale_timestamp' | 'stale_warning_timestamp' | 'culled_timestamp'
>;

export const getHostStalenessStatus = (
  value: StatusTimestamps,
  now: Date = new Date(),
): HostStalenessStatus | null => {
  const { stale_timestamp, stale_warning_timestamp, culled_timestamp } = value;

  if (!stale_timestamp) {
    return null;
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

  return null;
};

interface StatusProps {
  value: StatusTimestamps;
}

const staleStatus = (
  <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
    <Icon status="warning" className="pf-v6-u-mr-xs">
      <ExclamationTriangleIcon />
    </Icon>
    <span className="pf-v6-u-text-color-status-warning pf-v6-u-font-weight-bold">
      Stale
    </span>
  </span>
);

const staleWarningStatus = (
  <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
    <Icon status="danger" className="pf-v6-u-mr-xs">
      <ExclamationCircleIcon />
    </Icon>
    <span className="pf-v6-u-text-color-status-danger pf-v6-u-font-weight-bold">
      Stale warning
    </span>
  </span>
);

const Status = ({ value }: StatusProps) => {
  const status = getHostStalenessStatus(value);

  if (status === null) {
    return (
      <CellValue
        type="notAvailable"
        reason="Status data is not available for this system"
      />
    );
  }

  if (status === 'Stale') {
    return <CellValue type="present" value={staleStatus} />;
  }

  if (status === 'Stale warning') {
    return <CellValue type="present" value={staleWarningStatus} />;
  }

  return <CellValue type="present" value="Fresh" />;
};

export default Status;
