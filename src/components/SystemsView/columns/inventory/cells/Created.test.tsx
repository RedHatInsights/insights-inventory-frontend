import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Created from './Created';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import { NOT_AVAILABLE } from '../../CellValue';

function renderCreated(value: string | undefined) {
  return render(
    <TestWrapper>
      <Created value={value} />
    </TestWrapper>,
  );
}

const LONG_AGO_CREATED = '2020-01-01T00:00:00.000Z';

describe('Created cell', () => {
  it(`should show ${NOT_AVAILABLE} when value is undefined`, () => {
    renderCreated(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should render a relative date when value is set', () => {
    renderCreated(LONG_AGO_CREATED);

    expect(screen.getAllByText(/\d+ years ago/).length).toBeGreaterThan(0);
  });
});
