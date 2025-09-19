import { lastSeenFilterItems } from '../../Utilities';
import { useLastSeenFilter } from './useLastSeenFilter';
import { renderHook } from '@testing-library/react';

const mockDispatch = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useDispatch: () => mockDispatch,
}));

describe('useLastSeenFilter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('triggers navigate on filter', () => {
    const { result } = renderHook(() =>
      useLastSeenFilter([
        {
          lastSeenFilter: {
            mark: 'last24',
            lastCheckInEnd: '2025-01-27T22:06:08.176Z',
            lastCheckInStart: '2025-01-26T22:06:08.176Z',
          },
        },
        () => jest.fn(),
      ]),
    );

    const [filter] = result.current;
    expect(JSON.stringify(filter)).toEqual(
      JSON.stringify({
        label: 'Last seen',
        value: 'last_seen',
        type: 'singleSelect',
        filterValues: {
          value: 'last24',
          onChange: () => jest.fn(),
          items: lastSeenFilterItems,
        },
      }),
    );
  });
});
