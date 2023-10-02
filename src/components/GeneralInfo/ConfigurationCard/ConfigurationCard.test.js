/* eslint-disable camelcase */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useParams } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { RouterWrapper } from '../../../Utilities/TestingUtilities';
import { configTest } from '../../../__mocks__/selectors';
import ConfigurationCard from './ConfigurationCard';

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
    const view = render(
      <RouterWrapper>
        <ConfigurationCard store={store} />
      </RouterWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <RouterWrapper>
        <ConfigurationCard store={store} />
      </RouterWrapper>
    );
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
    const view = render(
      <RouterWrapper>
        <ConfigurationCard store={store} />
      </RouterWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('api', () => {
    it('should NOT call handleClick', async () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      render(
        <RouterWrapper>
          <ConfigurationCard store={store} />
        </RouterWrapper>
      );

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
      render(
        <RouterWrapper>
          <ConfigurationCard store={store} handleClick={onClick} />
        </RouterWrapper>
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
      render(
        <RouterWrapper>
          <ConfigurationCard store={store} handleClick={onClick} />
        </RouterWrapper>
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
      render(
        <RouterWrapper>
          <ConfigurationCard store={store} handleClick={onClick} />
        </RouterWrapper>
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
      render(
        <RouterWrapper>
          <ConfigurationCard store={store} handleClick={onClick} />
        </RouterWrapper>
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
      render(
        <RouterWrapper>
          <ConfigurationCard store={store} {...{ [flag]: false }} />
        </RouterWrapper>
      );

      expect(screen.queryByText(title)).not.toBeInTheDocument();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const view = render(
      <RouterWrapper>
        <ConfigurationCard
          store={store}
          extra={[
            { title: 'something', value: 'test' },
            {
              title: 'with click',
              value: '1 tests',
              onClick: (_e, handleClick) =>
                handleClick('Something', {}, 'small'),
            },
          ]}
        />
      </RouterWrapper>
    );

    expect(view.asFragment()).toMatchSnapshot();
  });
});
