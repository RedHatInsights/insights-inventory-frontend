import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LastSeen from './LastSeen';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { System } from '../../../hooks/useSystemsQuery';

const LONG_AGO_LAST_SEEN = '2020-01-01T00:00:00.000Z';

const SYSTEM_ID = 'test-system-id';

const systemWithLongAgoLastCheckIn = {
  id: SYSTEM_ID,
  last_check_in: LONG_AGO_LAST_SEEN,
} as unknown as System;

const systemWithUndefinedLastCheckIn = {
  id: SYSTEM_ID,
  last_check_in: undefined,
} as unknown as System;

const systemWithNullLastCheckIn = {
  id: SYSTEM_ID,
  last_check_in: null,
} as unknown as System;

const systemWithEmptyPerReporterStaleness = {
  id: SYSTEM_ID,
  last_check_in: LONG_AGO_LAST_SEEN,
  per_reporter_staleness: {},
} as unknown as System;

describe('LastSeen cell', () => {
  it('should render a relative last seen label for last_check_in', () => {
    render(
      <TestWrapper>
        <LastSeen system={systemWithLongAgoLastCheckIn} />
      </TestWrapper>,
    );

    expect(screen.getAllByText(/\d+ years ago/).length).toBeGreaterThan(0);
  });

  it('should show Invalid date when last_check_in is undefined', () => {
    render(
      <TestWrapper>
        <LastSeen system={systemWithUndefinedLastCheckIn} />
      </TestWrapper>,
    );

    expect(screen.getAllByText('Invalid date').length).toBeGreaterThan(0);
  });

  it('should show Invalid date when last_check_in is null', () => {
    render(
      <TestWrapper>
        <LastSeen system={systemWithNullLastCheckIn} />
      </TestWrapper>,
    );

    expect(screen.getAllByText('Invalid date').length).toBeGreaterThan(0);
  });

  it('should show the disconnected indicator when puptoo is missing from per_reporter_staleness', () => {
    render(
      <TestWrapper>
        <LastSeen system={systemWithEmptyPerReporterStaleness} />
      </TestWrapper>,
    );

    expect(
      screen.getByLabelText(/disconnected indicator/i),
    ).toBeInTheDocument();
  });
});
