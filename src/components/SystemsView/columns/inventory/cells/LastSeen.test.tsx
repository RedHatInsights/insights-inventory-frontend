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
  lastSeen: LONG_AGO_LAST_SEEN,
  culled: undefined,
  staleWarning: undefined,
  stale: undefined,
  perReporterStaleness: undefined,
};

describe('LastSeen cell', () => {
  it('should render a relative last seen label for lastSeen', () => {
    renderLastSeen(lastSeenValue);

    expect(screen.getAllByText(/\d+ years ago/).length).toBeGreaterThan(0);
  });

  it(`should show ${NOT_AVAILABLE} when lastSeen is undefined`, () => {
    renderLastSeen({ ...lastSeenValue, lastSeen: undefined });

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should show the disconnected indicator when puptoo is missing from perReporterStaleness', () => {
    renderLastSeen({
      ...lastSeenValue,
      perReporterStaleness: {},
    });

    expect(
      screen.getByLabelText(/disconnected indicator/i),
    ).toBeInTheDocument();
  });
});
