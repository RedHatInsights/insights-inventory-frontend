import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LastSeen, { type LastSeenValue } from './LastSeen';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import { NOT_AVAILABLE } from '../../CellValue';

const LONG_AGO_LAST_SEEN = '2020-01-01T00:00:00.000Z';

function renderLastSeen(value: LastSeenValue) {
  return render(
    <TestWrapper>
      <LastSeen value={value} />
    </TestWrapper>,
  );
}

const lastSeenValue: LastSeenValue = {
  last_check_in: LONG_AGO_LAST_SEEN,
  culled_timestamp: undefined,
  stale_warning_timestamp: undefined,
  stale_timestamp: undefined,
  per_reporter_staleness: undefined,
};

describe('LastSeen cell', () => {
  it('should render a relative last seen label for last_check_in', () => {
    renderLastSeen(lastSeenValue);

    expect(screen.getAllByText(/\d+ years ago/).length).toBeGreaterThan(0);
  });

  it(`should show ${NOT_AVAILABLE} when last_check_in is undefined`, () => {
    renderLastSeen({ ...lastSeenValue, last_check_in: undefined });

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when last_check_in is null`, () => {
    renderLastSeen({ ...lastSeenValue, last_check_in: null });

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should show the disconnected indicator when puptoo is missing from per_reporter_staleness', () => {
    renderLastSeen({
      ...lastSeenValue,
      per_reporter_staleness: {},
    });

    expect(
      screen.getByLabelText(/disconnected indicator/i),
    ).toBeInTheDocument();
  });
});
