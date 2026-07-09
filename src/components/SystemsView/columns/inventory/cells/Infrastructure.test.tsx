import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Infrastructure from './Infrastructure';
import { NOT_AVAILABLE } from '../../CellValue';

describe('Infrastructure cell', () => {
  it('should show the infrastructure type when value is present', () => {
    render(<Infrastructure value="virtual" />);

    expect(screen.getByText('virtual')).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when value is missing`, () => {
    const { rerender } = render(<Infrastructure value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Infrastructure value="" />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
