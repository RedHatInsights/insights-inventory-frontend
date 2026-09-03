import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DataCollector from './DataCollector';
import { NOT_AVAILABLE } from '../../CellValue';

describe('DataCollector cell', () => {
  it('labels rhsm-conduit as subscription-manager', () => {
    render(<DataCollector value={{ 'rhsm-conduit': {} }} />);

    expect(screen.getByText('subscription-manager')).toBeInTheDocument();
  });

  it('labels rhsm-system-profile-bridge as subscription-manager', () => {
    render(<DataCollector value={{ 'rhsm-system-profile-bridge': {} }} />);

    expect(screen.getByText('subscription-manager')).toBeInTheDocument();
    expect(
      screen.queryByText('rhsm-system-profile-bridge'),
    ).not.toBeInTheDocument();
  });

  it('shows a single subscription-manager label when reported by both rhsm reporters', () => {
    render(
      <DataCollector
        value={{ 'rhsm-conduit': {}, 'rhsm-system-profile-bridge': {} }}
      />,
    );

    expect(screen.getAllByText('subscription-manager')).toHaveLength(1);
    expect(
      screen.queryByText('rhsm-system-profile-bridge'),
    ).not.toBeInTheDocument();
  });

  it(`shows ${NOT_AVAILABLE} when there are no reporters`, () => {
    const { rerender } = render(<DataCollector value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<DataCollector value={{}} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
