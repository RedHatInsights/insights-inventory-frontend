import React from 'react';
import { Icon } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import CellValue from '../../CellValue';

export type HostStalenessStatus = 'Fresh' | 'Stale' | 'Stale warning';

export type StatusTimestamps = {
  stale?: string | null;
  staleWarning?: string | null;
  culled?: string | null;
};

export const getHostStalenessStatus = (
  value: StatusTimestamps,
  now: Date = new Date(),
): HostStalenessStatus | null => {
  const { stale, staleWarning, culled } = value;

  if (!stale) {
    return null;
  }

  const nowMs = now.getTime();
  const staleMs = new Date(stale).getTime();

  if (nowMs < staleMs) {
    return 'Fresh';
  }

  if (staleWarning) {
    const staleWarningMs = new Date(staleWarning).getTime();
    if (nowMs < staleWarningMs) {
      return 'Stale';
    }
  } else {
    return 'Stale';
  }

  if (culled) {
    const culledMs = new Date(culled).getTime();
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
