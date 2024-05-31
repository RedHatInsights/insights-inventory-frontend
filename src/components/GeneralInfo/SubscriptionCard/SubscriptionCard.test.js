import { render } from '@testing-library/react';
import React from 'react';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { subscriptionsTest } from '../../../__mocks__/selectors';
import SubscriptionCard from './SubscriptionCard';

describe('SubscriptionCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...subscriptionsTest,
          cpu_flags: ['one'],
        },
      },
    };
  });

  it('should render correctly - loading', () => {
    const store = mockStore({ systemProfileStore: {} });
    const view = render(
      <TestWrapper store={store}>
        <SubscriptionCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <SubscriptionCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  ['hasUsage', 'hasSLA', 'hasRole'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const view = render(
        <TestWrapper store={store}>
          <SubscriptionCard {...{ [item]: false }} />
        </TestWrapper>
      );
      expect(view.asFragment()).toMatchSnapshot();
    })
  );
});
