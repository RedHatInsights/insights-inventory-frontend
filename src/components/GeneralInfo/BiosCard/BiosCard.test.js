/* eslint-disable camelcase */
import React from 'react';
import BiosCard from './BiosCard';
import configureStore from 'redux-mock-store';
import { biosTest } from '../../../__mocks__/selectors';
import { renderWithRouter } from '../../../Utilities/TestingUtilities';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/example/path',
  }),
}));

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
    const view = renderWithRouter(<BiosCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = renderWithRouter(<BiosCard store={store} />);
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
    const view = renderWithRouter(<BiosCard store={store} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  ['hasVendor', 'hasVersion', 'hasReleaseDate'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const view = renderWithRouter(
        <BiosCard store={store} {...{ [item]: false }} />
      );
      expect(view.asFragment()).toMatchSnapshot();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const view = renderWithRouter(
      <BiosCard
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
