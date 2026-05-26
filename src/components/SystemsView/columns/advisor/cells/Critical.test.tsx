import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Critical from './Critical';
import type { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

const makeSystem = (critical?: number) =>
  ({
    app_data: { advisor: { critical } },
  }) as unknown as InventoryViewHost;

describe('Critical cell', () => {
  it('should render the critical count', () => {
    render(<Critical system={makeSystem(5)} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<Critical system={makeSystem(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // TODO: waiting for requrements clarification on how to handle missing data
  // it('should render nothing when advisor data is missing', () => {
  //   const { container } = render(
  //     <Critical system={{} as unknown as InventoryViewHost} />,
  //   );
  //   expect(container).toBeEmptyDOMElement();
  // });
});
