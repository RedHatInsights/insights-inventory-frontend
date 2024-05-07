import { render } from '@testing-library/react';
import React from 'react';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { BootcImageCard } from './BootcImageCard';

describe('BootcImageCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          bootc_status: {
            booted: {
              image: 'quay.io:5000/bootc-insights:latest',
              image_digest:
                'sha256:8fa5b818d1560c7d15d8744069651b671acd13ec5290c2bb55d1fae2492fcb5f',
            },
            rollback: {
              image: 'quay.io:5000/bootc-insights:latest',
              cached_image: 'quay.io:5000/bootc-insights:latest',
              image_digest:
                'sha256:99dec597bd1e95565d9df181cab9bf0278b15e79a613dbd0a357d60f295e9a72',
              cached_image_digest:
                'sha256:06462b5728c3b445df63327451c32874d946eb1f2071401680145d52e578137b',
            },
          },
          cpu_flags: ['one'],
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {} });
    const view = render(
      <TestWrapper store={store}>
        <BootcImageCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const view = render(
      <TestWrapper store={store}>
        <BootcImageCard />
      </TestWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });
});
