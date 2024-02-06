import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import configureStore from 'redux-mock-store';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
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
    render(
      <TestWrapper
        store={mockStore({ systemProfileStore: {}, entityDetails: {} })}
      >
        <OperatingSystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual(['', '', '', '', '']);
  });

  it('should render correctly with data', () => {
    render(
      <TestWrapper store={mockStore(initialState)}>
        <OperatingSystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'test-release',
      'test-kernel',
      'test-arch',
      'Not available',
      '0 modules',
    ]);
  });

  it('should render correctly with rhsm facts', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
            },
          },
        })}
      >
        <OperatingSystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'Not available',
      'x86_64',
      'Not available',
      'Not available',
    ]);
  });

  describe('api', () => {
    it('should not render modules clickable', () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <OperatingSystemCard />
        </TestWrapper>
      );

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
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/kernel_modules';
      render(
        <TestWrapper store={mockStore(initialState)}>
          <OperatingSystemCard handleClick={onClick} />
        </TestWrapper>
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
      render(
        <TestWrapper store={mockStore(initialState)}>
          <OperatingSystemCard {...{ [item]: false }} />
        </TestWrapper>
      );

      expect(
        screen.queryByRole('definition', { name: fields[index] })
      ).not.toBeInTheDocument();
    })
  );

  it('should render extra', () => {
    render(
      <TestWrapper store={mockStore(initialState)}>
        <OperatingSystemCard
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

    screen.getByRole('definition', {
      name: /something value/i,
    });
    screen.getByRole('link', {
      name: /1 tests/i,
    });
  });
});
