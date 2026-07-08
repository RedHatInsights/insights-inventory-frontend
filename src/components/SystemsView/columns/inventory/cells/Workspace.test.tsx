import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Workspace from './Workspace';
import { NOT_AVAILABLE } from '../../CellValue';
import { UNGROUPED_HOSTS_LABEL } from '../../../constants';

describe('Workspace cell', () => {
  it('should show the workspace name when present', () => {
    render(<Workspace value={[{ name: 'Production' }]} />);

    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('should show the ungrouped hosts label as not set when the workspace is ungrouped', () => {
    render(<Workspace value={[{ ungrouped: true }]} />);

    expect(screen.getByText(UNGROUPED_HOSTS_LABEL)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when workspace data is missing`, () => {
    const { rerender } = render(<Workspace value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Workspace value={[]} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Workspace value={[{}]} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
