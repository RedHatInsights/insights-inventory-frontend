import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Moderate from './Moderate';
import type { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

const makeSystem = (moderate?: number) =>
  ({
    app_data: { advisor: { moderate } },
  }) as unknown as InventoryViewHost;

describe('Moderate cell', () => {
  it('should render the moderate count', () => {
    render(<Moderate system={makeSystem(9)} />);
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<Moderate system={makeSystem(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render N/A when advisor data is missing', () => {
    render(<Moderate system={{} as unknown as InventoryViewHost} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
