import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Low from './Low';
import type { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

const makeSystem = (low?: number) =>
  ({
    app_data: { advisor: { low } },
  }) as unknown as InventoryViewHost;

describe('Low cell', () => {
  it('should render the low count', () => {
    render(<Low system={makeSystem(12)} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<Low system={makeSystem(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // TODO: waiting for requrements clarification on how to handle missing data
  // it('should render nothing when advisor data is missing', () => {
  //   const { container } = render(
  //     <Low system={{} as unknown as InventoryViewHost} />,
  //   );
  //   expect(container).toBeEmptyDOMElement();
  // });
});
