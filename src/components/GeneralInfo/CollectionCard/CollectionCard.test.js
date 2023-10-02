/* eslint-disable camelcase */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import configureStore from 'redux-mock-store';
import { RouterWrapper } from '../../../Utilities/TestingUtilities';
import { collectInfoTest } from '../../../__mocks__/selectors';
import CollectionCard from './CollectionCard';

describe('CollectionCard', () => {
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
          ...collectInfoTest,
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const view = render(<CollectionCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(<CollectionCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders tooltip for version', async () => {
    const store = mockStore(initialState);
    render(
      <RouterWrapper>
        <CollectionCard store={store} />
      </RouterWrapper>
    );
    await userEvent.hover(screen.getByText('test-client'));
    await screen.findByText(/RPM version: test-client/i);
    await screen.findByText(/Dynamic update version: test-egg/i);
  });

  [
    ['hasClient', 'Insights client'],
    ['hasLastCheckIn', 'Last check-in'],
    ['hasRegistered', 'Registered'],
    ['hasInsightsId', 'Insights id'],
    ['hasReporter', 'Reporter'],
  ].map(([flag, title]) =>
    it(`should not render ${title}`, () => {
      const store = mockStore(initialState);
      render(
        <RouterWrapper>
          <CollectionCard store={store} {...{ [flag]: false }} />
        </RouterWrapper>
      );
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const view = render(
      <RouterWrapper>
        <CollectionCard
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
