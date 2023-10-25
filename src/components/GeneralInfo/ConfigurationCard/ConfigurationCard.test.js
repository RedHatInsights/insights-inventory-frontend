/* eslint-disable camelcase */
import React from 'react';
import ConfigurationCard from './ConfigurationCard';
import configureStore from 'redux-mock-store';
import { configTest } from '../../../__mocks__/selectors';
import { renderWithRouter } from '../../../Utilities/TestingUtilities';
import { useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

const location = {};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({
    modalId: 'testModal',
  })),
}));

describe('ConfigurationCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...configTest,
        },
      },
    };
    location.pathname = 'localhost:3000/example/path';
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const view = renderWithRouter(<ConfigurationCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = renderWithRouter(<ConfigurationCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render enabled/disabled', () => {
    const store = mockStore({
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...configTest,
          repositories: {
            enabled: [{}],
            disabled: [{}],
          },
        },
      },
    });
    const view = renderWithRouter(<ConfigurationCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('api', () => {
    it('should NOT call handleClick', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      renderWithRouter(<ConfigurationCard store={store} />);

      await userEvent.click(screen.getAllByRole('link')[0]);
      await waitFor(() => {
        expect(onClick).not.toHaveBeenCalled();
      });
    });

    it('should call handleClick on packages', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/installed_packages';
      useParams.mockImplementation(() => ({ modalId: 'installed_packages' }));
      renderWithRouter(
        <ConfigurationCard handleClick={onClick} store={store} />
      );

      await userEvent.click(screen.getAllByRole('link')[0]);
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });

    it('should call handleClick on services', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/services';
      useParams.mockImplementation(() => ({ modalId: 'services' }));
      renderWithRouter(
        <ConfigurationCard handleClick={onClick} store={store} />
      );

      await userEvent.click(screen.getAllByRole('link')[1]);
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });

    it('should call handleClick on processes', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/running_processes';
      useParams.mockImplementation(() => ({ modalId: 'running_processes' }));
      renderWithRouter(
        <ConfigurationCard handleClick={onClick} store={store} />
      );

      await userEvent.click(screen.getAllByRole('link')[2]);
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });

    it('should call handleClick on repositories', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/repositories';
      useParams.mockImplementation(() => ({ modalId: 'repositories' }));
      renderWithRouter(
        <ConfigurationCard handleClick={onClick} store={store} />
      );

      await userEvent.click(screen.getAllByRole('link')[3]);
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });
  });

  [
    ['hasPackages', 'Installed packages'],
    ['hasServices', 'Services'],
    ['hasProcesses', 'Running processes'],
    ['hasRepositories', 'Repositories'],
  ].map(([flag, title]) =>
    it(`should not render ${title}`, () => {
      const store = mockStore(initialState);
      renderWithRouter(
        <ConfigurationCard store={store} {...{ [flag]: false }} />
      );
      expect(screen.queryByText(title)).toBeNull();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const view = renderWithRouter(
      <ConfigurationCard
        store={store}
        extra={[
          { title: 'something', value: 'test' },
          {
            title: 'with click',
            value: '1 tests',
            onClick: (_e, handleClick) => handleClick('Something', {}, 'small'),
          },
        ]}
      />
    );
    expect(view.asFragment()).toMatchSnapshot();
  });
});
