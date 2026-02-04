import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useParams } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { infraTest, rhsmFacts } from '../../../__mocks__/selectors';
import NetworkInterfacesCard from './NetworkInterfacesCard';

const location = {};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({ modalId: 'ipv4' })),
}));

describe('NetworkInterfacesCard', () => {
  let initialState;
  let mockStore;
  const entity = {
    facts: {
      rhsm: rhsmFacts,
    },
  };

  beforeEach(() => {
    location.pathname = 'localhost:3000/example/path';
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const view = render(
      <TestWrapper store={store}>
        <NetworkInterfacesCard />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <NetworkInterfacesCard entity={entity} />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with rhsm facts', () => {
    const store = mockStore({
      ...initialState,
      systemProfileStore: {
        systemProfile: {
          loaded: true,
        },
      },
    });
    const view = render(
      <TestWrapper store={store}>
        <NetworkInterfacesCard entity={entity} />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render enabled/disabled', () => {
    const store = mockStore({
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
        },
      },
    });
    const view = render(
      <TestWrapper store={store}>
        <NetworkInterfacesCard />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('api', () => {
    it('should call handleClick on ipv4', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/ipv4';
      useParams.mockImplementation(() => ({ modalId: 'ipv4' }));
      render(
        <TestWrapper store={store}>
          <NetworkInterfacesCard handleClick={onClick} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(
        screen.getAllByRole('link', { name: /1 address/i })[0],
      );
      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should call handleClick on ipv6', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/ipv6';
      useParams.mockImplementation(() => ({ modalId: 'ipv6' }));
      render(
        <TestWrapper store={store}>
          <NetworkInterfacesCard handleClick={onClick} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(
        screen.getAllByRole('link', { name: /1 address/i })[1],
      );
      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should call handleClick on interfaces', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/interfaces';
      useParams.mockImplementation(() => ({ modalId: 'interfaces' }));
      render(
        <TestWrapper store={store}>
          <NetworkInterfacesCard handleClick={onClick} entity={entity} />
        </TestWrapper>,
      );

      await userEvent.click(screen.getByRole('link', { name: /1 NIC/i }));
      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  ['hasIPv4', 'hasIPv6', 'hasInterfaces', 'hasFqdn'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const view = render(
        <TestWrapper store={store}>
          <NetworkInterfacesCard {...{ [item]: false }} entity={entity} />
        </TestWrapper>,
      );

      expect(view.asFragment()).toMatchSnapshot();
    }),
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <NetworkInterfacesCard
          extra={[
            { title: 'something', value: 'test' },
            {
              title: 'with click',
              value: '1 tests',
              onClick: (_e, handleClick) =>
                handleClick('Something', {}, 'small'),
            },
          ]}
          entity={entity}
        />
      </TestWrapper>,
    );

    expect(view.asFragment()).toMatchSnapshot();
  });
});
