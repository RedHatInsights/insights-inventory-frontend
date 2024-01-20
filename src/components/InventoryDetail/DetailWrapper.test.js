import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { mock } from '../../__mocks__/systemIssues';
import { BasicInfo } from '../InventoryDetailDrawer';
import DetailWrapper from './DetailWrapper';

jest.mock('../InventoryDetailDrawer', () => ({
  ...jest.requireActual('../InventoryDetailDrawer'),
  BasicInfo: jest.fn(),
}));

describe('DetailWrapper', () => {
  mock.onGet('/api/patch/v3/systems/test-id').reply(200, 'test');
  mock.onGet('/api/insights/v1/system/test-id/reports/').reply(200, 'test');
  mock
    .onGet(
      '/api/vulnerability//v1/systems/test-id/cves?page=1&page_size=1&impact=2'
    )
    .reply(200, 'low-test');
  mock
    .onGet(
      '/api/vulnerability//v1/systems/test-id/cves?page=1&page_size=1&impact=4'
    )
    .reply(200, 'moderate-test');
  mock
    .onGet(
      '/api/vulnerability//v1/systems/test-id/cves?page=1&page_size=1&impact=5'
    )
    .reply(200, 'important-test');
  mock
    .onGet(
      '/api/vulnerability//v1/systems/test-id/cves?page=1&page_size=1&impact=7'
    )
    .reply(200, 'critical-test');
  mock
    .onGet(
      '/api/vulnerability//v1/systems/test-id/cves?page=1&page_size=1&impact=2'
    )
    .reply(500);
  mock.onPost('/api/compliance/graphql').reply(200, 'test');
  let initialState;
  let mockStore;
  const _Date = Date;
  const currDate = new Date('1970');
  beforeAll(() => {
    /*eslint no-global-assign:off*/
    Date = class extends Date {
      constructor(...props) {
        if (props.length > 0) {
          return new _Date(...props);
        }

        return currDate;
      }

      static now() {
        return new _Date('1970').getTime();
      }
    };
  });

  afterAll(() => {
    Date = _Date;
  });
  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware()]);
    initialState = {
      entityDetails: {
        loaded: true,
        entity: {
          id: 'some-id',
          updated: new Date(),
          culled_timestamp: new Date(),
          stale_warning_timestamp: new Date(),
          stale_timestamp: new Date(),
        },
        isToggleOpened: true,
      },
    };
  });

  describe('DOM', () => {
    beforeAll(() => {
      BasicInfo.mockImplementation(
        jest.requireActual('../InventoryDetailDrawer').BasicInfo
      );
    });

    it('should render without data', () => {
      const store = mockStore({
        entityDetails: {},
      });
      const view = render(
        <Provider store={store}>
          <DetailWrapper />
        </Provider>
      );

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('should render with data', () => {
      const store = mockStore(initialState);
      const view = render(
        <Provider store={store}>
          <DetailWrapper />
        </Provider>
      );

      expect(view.asFragment()).toMatchSnapshot();
    });

    it('should pass correct props to BasicInfo', () => {
      BasicInfo.mockImplementation(() => <span>BasicInfo</span>);
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper />
        </Provider>
      );

      expect(BasicInfo).toHaveBeenCalledWith(
        {
          hideInvLink: undefined,
          showTags: undefined,
        },
        {} // ref
      );
    });

    it('should render Wrapper', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper Wrapper={() => <h2 aria-label="test">something</h2>} />
        </Provider>
      );

      expect(screen.getByRole('heading', { name: 'test' })).toHaveTextContent(
        'something'
      );
    });

    it('should render disabled insights icon when no insights_id', () => {
      initialState = {
        entityDetails: {
          loaded: true,
          entity: {
            id: 'some-id',
            updated: new Date(),
            culled_timestamp: new Date(),
            stale_warning_timestamp: new Date(),
            stale_timestamp: new Date(),
            per_reporter_staleness: {},
          },
          isToggleOpened: true,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper />
        </Provider>
      );

      expect(screen.getByLabelText('Disconnected indicator')).toBeVisible();
    });

    it('should not render disabled isnights icon when insights_id', () => {
      initialState = {
        entityDetails: {
          loaded: true,
          entity: {
            id: 'some-id',
            updated: new Date(),
            culled_timestamp: new Date(),
            stale_warning_timestamp: new Date(),
            stale_timestamp: new Date(),
            per_reporter_staleness: {
              puptoo: {
                stale_timestamp: new Date(),
              },
            },
          },
          isToggleOpened: true,
        },
      };
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper />
        </Provider>
      );

      expect(
        screen.queryByLabelText('Disconnected indicator')
      ).not.toBeInTheDocument();
    });

    it('should render children', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper>
            <h2 aria-label="test">something</h2>
          </DetailWrapper>
        </Provider>
      );

      expect(screen.getByRole('heading', { name: 'test' })).toHaveTextContent(
        'something'
      );
    });

    it('should calculate classnames', () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper className="test-classname" />
        </Provider>
      );

      expect(screen.getByTestId('inventory-drawer')).toHaveClass(
        'test-classname'
      );
    });
  });

  describe('API', () => {
    it('should call open', async () => {
      const store = mockStore(initialState);
      render(
        <Provider store={store}>
          <DetailWrapper className="test" />
        </Provider>
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /close drawer panel/i,
        })
      );
      const actions = store.getActions();
      expect(actions[actions.length - 1]).toMatchObject({
        payload: { isOpened: false },
        type: 'TOGGLE_INVENTORY_DRAWER',
      });
    });
  });
});
