import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import configureStore from 'redux-mock-store';
import { renderWithRouter } from '../../../Utilities/TestingUtilities';
import { osTest, rhsmFacts } from '../../../__mocks__/selectors';
import OperatingSystemCard from './OperatingSystemCard';

const location = {};

const fields = [
  'Release',
  'Kernel release',
  'Architecture',
  'Last boot time',
  'Kernel modules',
];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({ modalId: 'kernel_modules' })),
}));

describe('OperatingSystemCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    location.pathname = 'localhost:3000/example/path';
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...osTest,
        },
      },
      entityDetails: {
        entity: {
          facts: {
            rhsm: rhsmFacts,
          },
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    renderWithRouter(<OperatingSystemCard store={store} />);

    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe('');
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    renderWithRouter(<OperatingSystemCard store={store} />);

    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe('test-releasetest-kerneltest-archNot available0 modules');
  });

  it('should render correctly with rhsm facts', () => {
    const store = mockStore({
      ...initialState,
      systemProfileStore: {
        systemProfile: {
          loaded: true,
        },
      },
    });

    renderWithRouter(<OperatingSystemCard store={store} />);
    expect(
      screen
        .getAllByRole('definition')
        .reduce((prev, cur) => prev.concat(cur.textContent), '')
    ).toBe('Not availableNot availablex86_64Not availableNot available');
  });

  describe('api', () => {
    it('should not render modules clickable', () => {
      const store = mockStore(initialState);
      renderWithRouter(<OperatingSystemCard store={store} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should call handleClick on packages', async () => {
      initialState = {
        systemProfileStore: {
          systemProfile: {
            loaded: true,
            ...osTest,
            kernel_modules: ['some-module'],
          },
        },
        entityDetails: {
          entity: {
            facts: {
              rhsm: rhsmFacts,
            },
          },
        },
      };
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/kernel_modules';
      renderWithRouter(
        <OperatingSystemCard handleClick={onClick} store={store} />
      );

      await userEvent.click(screen.getByRole('link'));
      expect(onClick).toHaveBeenCalled();
    });
  });

  [
    'hasRelease',
    'hasKernelRelease',
    'hasArchitecture',
    'hasLastBoot',
    'hasKernelModules',
  ].map((item, index) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      renderWithRouter(
        <OperatingSystemCard store={store} {...{ [item]: false }} />
      );

      expect(
        screen.queryByRole('definition', { name: fields[index] })
      ).not.toBeInTheDocument();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    renderWithRouter(
      <OperatingSystemCard
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

    screen.getByRole('definition', {
      name: /something value/i,
    });
    screen.getByRole('link', {
      name: /1 tests/i,
    });
  });
});
