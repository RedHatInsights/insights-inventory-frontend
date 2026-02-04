import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { testProperties, infraTest } from '../../../__mocks__/selectors';
import HardwarePropertiesCard from './HardwarePropertiesCard';

const entity = {
  id: 'test-id',
  facts: {},
};

describe('HardwarePropertiesCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...testProperties,
          ...infraTest,
        },
      },
    };
  });

  it('should render correctly with data', () => {
    render(
      <TestWrapper store={mockStore(initialState)}>
        <HardwarePropertiesCard entity={entity} />
      </TestWrapper>,
    );

    expect(screen.getByText('Hardware properties')).toBeInTheDocument();
    expect(screen.getByText('Number of CPUs')).toBeInTheDocument();
    expect(screen.getByText('RAM')).toBeInTheDocument();
    expect(screen.getByText('Sockets')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Cores per socket')).toBeInTheDocument();
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('CPU flags')).toBeInTheDocument();

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent),
    ).toEqual(['1', '5 MB', '1', 'test-type', '1', 'test-vendor', '0 flags']);
  });

  it('should render loading state', () => {
    render(
      <TestWrapper
        store={mockStore({
          systemProfileStore: { systemProfile: { loaded: false } },
        })}
      >
        <HardwarePropertiesCard entity={entity} />
      </TestWrapper>,
    );

    expect(screen.getByText('Hardware properties')).toBeInTheDocument();
  });
});
