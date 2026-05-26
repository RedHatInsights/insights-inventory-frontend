import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Recommendations from './Recommendations';
import type { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

const makeSystem = (recommendations?: number) =>
  ({
    app_data: { advisor: { recommendations } },
  }) as unknown as InventoryViewHost;

describe('Recommendations cell', () => {
  it('should render the recommendations count', () => {
    render(<Recommendations system={makeSystem(4)} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<Recommendations system={makeSystem(0)} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // TODO: waiting for requrements clarification on how to handle missing data
  // it('should render nothing when advisor data is missing', () => {
  //   const { container } = render(
  //     <Recommendations system={{} as unknown as InventoryViewHost} />,
  //   );
  //   expect(container).toBeEmptyDOMElement();
  // });
});
