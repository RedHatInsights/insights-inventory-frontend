import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Incidents from './Incidents';
import type { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

const makeSystem = (incidents?: number) =>
  ({
    app_data: { advisor: { incidents } },
  }) as unknown as InventoryViewHost;

describe('Incidents cell', () => {
  it('should render the incidents count', () => {
    render(<Incidents system={makeSystem(7)} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<Incidents system={makeSystem(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render N/A when advisor data is missing', () => {
    render(<Incidents system={{} as unknown as InventoryViewHost} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
