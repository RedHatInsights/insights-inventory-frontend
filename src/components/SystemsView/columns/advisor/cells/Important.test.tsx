import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Important from './Important';
import type { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

const makeSystem = (important?: number) =>
  ({
    app_data: { advisor: { important } },
  }) as unknown as InventoryViewHost;

describe('Important cell', () => {
  it('should render the important count', () => {
    render(<Important system={makeSystem(3)} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<Important system={makeSystem(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render N/A when advisor data is missing', () => {
    render(<Important system={{} as unknown as InventoryViewHost} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
