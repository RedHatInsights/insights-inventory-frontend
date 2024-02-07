import { render } from '@testing-library/react';
import React from 'react';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { biosTest } from '../../../__mocks__/selectors';
import BiosCard from './BiosCard';

describe('BiosCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...biosTest,
          cpu_flags: ['one'],
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {} });
    const view = render(
      <TestWrapper store={store}>
        <BiosCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <BiosCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data - wrong date', () => {
    const store = mockStore({
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...biosTest,
          bios_release_date: 'test',
          cpu_flags: ['one'],
        },
      },
    });
    const view = render(
      <TestWrapper store={store}>
        <BiosCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  ['hasVendor', 'hasVersion', 'hasReleaseDate'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const view = render(
        <TestWrapper store={store}>
          <BiosCard {...{ [item]: false }} />
        </TestWrapper>
      );
      expect(view.asFragment()).toMatchSnapshot();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <BiosCard
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
      </TestWrapper>
    );

    expect(view.asFragment()).toMatchSnapshot();
  });
});
