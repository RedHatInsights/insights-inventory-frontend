import React from 'react';
import '@testing-library/jest-dom';
import DataCollectorsCard from './DataCollectorsCard';
import configureStore from 'redux-mock-store';
import { render, screen } from '@testing-library/react';
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

describe('DataCollectorsCard', () => {
  let initialState;
  let mockStore;
  const entity = {
    per_reporter_staleness: {
      puptoo: {
        check_in_succeeded: true,
        last_check_in: '2022-05-13T07:42:21.663665+00:00',
        stale_timestamp: '2260-01-01T00:00:00+00:00',
      },
    },
    insights_id: '1234',
  };

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const view = render(
      <TestWrapper store={store}>
        <DataCollectorsCard />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <DataCollectorsCard entity={entity} />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should show ClipboardCopy for Insights Client ID when insights_id is present', () => {
    const store = mockStore(initialState);
    render(
      <TestWrapper store={store}>
        <DataCollectorsCard entity={entity} />
      </TestWrapper>,
    );

    expect(screen.getByText('1234')).toBeInTheDocument();
    const copyButtons = screen.getAllByRole('button', {
      name: /copy to clipboard/i,
    });
    expect(copyButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('should not show ID row when insights_id is absent', () => {
    const entityWithoutIds = {
      ...entity,
      insights_id: undefined,
    };
    const store = mockStore(initialState);
    render(
      <TestWrapper store={store}>
        <DataCollectorsCard entity={entityWithoutIds} />
      </TestWrapper>,
    );

    // With no insights_id, the details row with id value is not shown
    expect(screen.queryByText('1234')).not.toBeInTheDocument();
  });

  it('should show ClipboardCopy for Subscription Manager ID when present', () => {
    const entityWithSubId = {
      ...entity,
      subscription_manager_id: 'sub-mgr-uuid-123',
    };
    const store = mockStore(initialState);
    render(
      <TestWrapper store={store}>
        <DataCollectorsCard entity={entityWithSubId} />
      </TestWrapper>,
    );

    expect(screen.getByText('sub-mgr-uuid-123')).toBeInTheDocument();
  });

  it('should render custom collectors', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <DataCollectorsCard
          entity={entity}
          {...{
            collectors: [
              {
                name: 'collector name',
                status: true,
                updated: '2260-01-01T00:00:00+00:00',
                details: {
                  name: 'reporter id',
                  id: '1234567',
                },
              },
            ],
          }}
        />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });
});
