import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Vendor from './Vendor';
import { NOT_AVAILABLE } from '../../CellValue';

describe('Vendor cell', () => {
  it('should show the vendor when value is present', () => {
    render(<Vendor value="qemu" />);

    expect(screen.getByText('qemu')).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when value is missing`, () => {
    const { rerender } = render(<Vendor value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Vendor value={null} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Vendor value="" />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
