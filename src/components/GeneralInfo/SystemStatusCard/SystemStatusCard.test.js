import React from 'react';
import SystemStatusCard from './SystemStatusCard';
import configureStore from 'redux-mock-store';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../../../Utilities/TestingUtilities';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/example/path',
  }),
  useHistory: () => ({
    push: () => undefined,
  }),
}));

describe('SystemStatusCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      entityDetails: {
        entity: {
          per_reporter_staleness: {
            reporter1: {
              last_check_in: '2025-03-05T00:00:00.0+00:00',
            },
            reporter2: {
              last_check_in: '2025-03-06T00:00:00.0+00:00',
            },
          },
          updated: '2014-06-01T00:00:00.0+00:00',
          created: '2014-04-01T00:00:00.0+00:00',
        },
      },
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          rhc_client_id: ['1234'],
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const view = render(<SystemStatusCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(<SystemStatusCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  ['hasState', 'hasLastCheckIn', 'hasRegistered', 'hasRHC'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const view = render(
        <SystemStatusCard store={store} {...{ [item]: false }} />
      );
      expect(view.asFragment()).toMatchSnapshot();
    })
  );

  it('should display most recent date from reporters', () => {
    const store = mockStore(initialState);
    render(<SystemStatusCard store={store} />);

    expect(screen.getByLabelText('Last seen value')).toHaveTextContent(
      '06 Mar 2025 00:00 UTC'
    );
  });

  it('should render correctly with data', async () => {
    const store = mockStore(initialState);
    render(
      <TestWrapper store={store}>
        <SystemStatusCard />
      </TestWrapper>
    );

    expect(
      screen.queryByText(
        /the displayed rhc status indicates that the rhc client is installed and configured but may not reflect actual connectivity\. for further troubleshooting, please visit \./i
      )
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /action for rhc/i })
    );

    expect(
      screen.getByText(
        /the displayed rhc status indicates that the rhc client is installed and configured but may not reflect actual connectivity\. for further troubleshooting, please visit \./i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /rhc-remediations-link/i,
      })
    ).toBeInTheDocument();
  });
});
