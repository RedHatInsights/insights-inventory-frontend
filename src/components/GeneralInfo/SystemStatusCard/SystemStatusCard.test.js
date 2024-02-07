import React from 'react';
import SystemStatusCard from './SystemStatusCard';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';

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
          updated: '6/01/2014',
          created: '04/01/2014',
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
});
