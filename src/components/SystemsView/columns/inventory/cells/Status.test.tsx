import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Status, {
  getHostStalenessStatus,
  type StatusTimestamps,
} from './Status';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import { NOT_AVAILABLE } from '../../CellValue';

const NOW = new Date('2024-06-15T12:00:00.000Z');

const freshValue: StatusTimestamps = {
  stale: '2024-07-01T00:00:00.000Z',
  staleWarning: '2024-08-01T00:00:00.000Z',
  culled: '2024-09-01T00:00:00.000Z',
};

const staleValue: StatusTimestamps = {
  stale: '2024-06-01T00:00:00.000Z',
  staleWarning: '2024-07-01T00:00:00.000Z',
  culled: '2024-08-01T00:00:00.000Z',
};

const staleWarningValue: StatusTimestamps = {
  stale: '2024-05-01T00:00:00.000Z',
  staleWarning: '2024-06-01T00:00:00.000Z',
  culled: '2024-08-01T00:00:00.000Z',
};

const unknownValue: StatusTimestamps = {
  stale: null,
  staleWarning: undefined,
  culled: undefined,
};

const culledValue: StatusTimestamps = {
  stale: '2024-01-01T00:00:00.000Z',
  staleWarning: '2024-02-01T00:00:00.000Z',
  culled: '2024-03-01T00:00:00.000Z',
};

describe('getHostStalenessStatus', () => {
  it('returns Fresh when the current time is before stale', () => {
    expect(getHostStalenessStatus(freshValue, NOW)).toBe('Fresh');
  });

  it('returns Stale when the current time is past stale but before staleWarning', () => {
    expect(getHostStalenessStatus(staleValue, NOW)).toBe('Stale');
  });

  it('returns Stale warning when the current time is past staleWarning but before culled', () => {
    expect(getHostStalenessStatus(staleWarningValue, NOW)).toBe(
      'Stale warning',
    );
  });

  it('returns null when stale is missing', () => {
    expect(getHostStalenessStatus(unknownValue, NOW)).toBeNull();
  });

  it('returns null when all staleness timestamps are in the past', () => {
    expect(getHostStalenessStatus(culledValue, NOW)).toBeNull();
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
        <Status value={freshValue} />
      </TestWrapper>,
    );

    expect(screen.getByText('Fresh')).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders Stale with a warning icon and warning text color', () => {
    render(
      <TestWrapper>
        <Status value={staleValue} />
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
        <Status value={staleWarningValue} />
      </TestWrapper>,
    );

    expect(screen.getByText('Stale warning')).toHaveClass(
      'pf-v6-u-text-color-status-danger',
    );
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it(`renders ${NOT_AVAILABLE} when staleness cannot be determined`, () => {
    render(
      <TestWrapper>
        <Status value={unknownValue} />
      </TestWrapper>,
    );

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
