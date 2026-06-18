import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Status, { getHostStalenessStatus } from './Status';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { System } from '../../../hooks/useSystemsQuery';
import { NOT_AVAILABLE } from '../../../../../constants';

const NOW = new Date('2024-06-15T12:00:00.000Z');

const freshSystem = {
  id: 'fresh-system',
  stale_timestamp: '2024-07-01T00:00:00.000Z',
  stale_warning_timestamp: '2024-08-01T00:00:00.000Z',
  culled_timestamp: '2024-09-01T00:00:00.000Z',
} as System;

const staleSystem = {
  id: 'stale-system',
  stale_timestamp: '2024-06-01T00:00:00.000Z',
  stale_warning_timestamp: '2024-07-01T00:00:00.000Z',
  culled_timestamp: '2024-08-01T00:00:00.000Z',
} as System;

const staleWarningSystem = {
  id: 'stale-warning-system',
  stale_timestamp: '2024-05-01T00:00:00.000Z',
  stale_warning_timestamp: '2024-06-01T00:00:00.000Z',
  culled_timestamp: '2024-08-01T00:00:00.000Z',
} as System;

const unknownSystem = {
  id: 'unknown-system',
  stale_timestamp: null,
} as System;

describe('getHostStalenessStatus', () => {
  it('returns Fresh when the current time is before stale_timestamp', () => {
    expect(getHostStalenessStatus(freshSystem, NOW)).toBe('Fresh');
  });

  it('returns Stale when the current time is past stale_timestamp but before stale_warning_timestamp', () => {
    expect(getHostStalenessStatus(staleSystem, NOW)).toBe('Stale');
  });

  it('returns Stale warning when the current time is past stale_warning_timestamp but before culled_timestamp', () => {
    expect(getHostStalenessStatus(staleWarningSystem, NOW)).toBe(
      'Stale warning',
    );
  });

  it(`returns ${NOT_AVAILABLE} when stale_timestamp is missing`, () => {
    expect(getHostStalenessStatus(unknownSystem, NOW)).toBe(NOT_AVAILABLE);
  });
});

describe('Status cell', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders plain Fresh text without an icon', () => {
    render(
      <TestWrapper>
        <Status system={freshSystem} />
      </TestWrapper>,
    );

    expect(screen.getByText('Fresh')).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders Stale with a warning icon and warning text color', () => {
    render(
      <TestWrapper>
        <Status system={staleSystem} />
      </TestWrapper>,
    );

    expect(screen.getByText('Stale')).toHaveClass(
      'pf-v6-u-text-color-status-warning',
    );
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders Stale warning with a danger icon and danger text color', () => {
    render(
      <TestWrapper>
        <Status system={staleWarningSystem} />
      </TestWrapper>,
    );

    expect(screen.getByText('Stale warning')).toHaveClass(
      'pf-v6-u-text-color-status-danger',
    );
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders N/A when staleness cannot be determined', () => {
    render(
      <TestWrapper>
        <Status system={unknownSystem} />
      </TestWrapper>,
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
