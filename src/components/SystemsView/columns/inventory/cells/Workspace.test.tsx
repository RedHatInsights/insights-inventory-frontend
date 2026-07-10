import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Workspace from './Workspace';
import { NOT_AVAILABLE } from '../../CellValue';
const UNGROUPED_HOSTS_LABEL = 'Ungrouped Hosts';

describe('Workspace cell', () => {
  it('should show the workspace name when present', () => {
    render(<Workspace value={[{ name: 'Production' }]} />);

    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when workspace data is missing`, () => {
    const { rerender } = render(<Workspace value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Workspace value={[]} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
