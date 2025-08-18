import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import {
  subscriptionsTestFacts,
  subscriptionsTestSystemPurpose,
} from '../../../__mocks__/selectors';
import SubscriptionCard from './SubscriptionCard';
import '@testing-library/jest-dom';

describe('SubscriptionCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          cpu_flags: ['one'],
        },
      },
      entityDetails: {
        entity: {
          ...subscriptionsTestFacts,
        },
      },
    };
  });

  it('should render correctly - loading', () => {
    const store = mockStore({ entityDetails: {}, systemProfileStore: {} });
    const view = render(
      <TestWrapper store={store}>
        <SubscriptionCard />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <SubscriptionCard />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  ['hasUsage', 'hasSLA', 'hasRole'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const view = render(
        <TestWrapper store={store}>
          <SubscriptionCard {...{ [item]: false }} />
        </TestWrapper>,
      );
      expect(view.asFragment()).toMatchSnapshot();
    }),
  );

  it('should render correctly with subscription system_purpose data', async () => {
    initialState.systemProfileStore.systemProfile.system_purpose =
      subscriptionsTestSystemPurpose.system_purpose;
    initialState.entityDetails.entity.facts = undefined;

    const store = mockStore(initialState);
    render(
      <TestWrapper store={store}>
        <SubscriptionCard />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('Development')).toBeInTheDocument();
    });
  });
});
