import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NOT_AVAILABLE } from '../../CellValue';
import TagKeyValues from './TagKeyValues';

describe('TagKeyValues', () => {
  it('shows the empty placeholder when the system has no value', () => {
    render(<TagKeyValues identity="owner" values={[]} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        'Not available. This system does not have this tag',
      ),
    ).toBeInTheDocument();
  });

  it('renders each value as a label', () => {
    render(
      <TagKeyValues
        identity="insights-client/env"
        values={['prod', 'stage']}
      />,
    );

    expect(screen.getByText('prod')).toBeInTheDocument();
    expect(screen.getByText('stage')).toBeInTheDocument();
  });

  it('overflows after three values', () => {
    render(<TagKeyValues identity="env" values={['a', 'b', 'c', 'd']} />);

    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
    expect(screen.queryByText('d')).not.toBeInTheDocument();
    expect(screen.getByText(/1 more/i)).toBeInTheDocument();
  });
});
