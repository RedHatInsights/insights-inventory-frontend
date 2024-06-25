import { act, renderHook, waitFor } from '@testing-library/react';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import useGroupFilter from './useGroupFilter';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import useWorkspaceFeatureFlag from '../../Utilities/hooks/useWorkspaceFeatureFlag';

jest.mock('../../Utilities/hooks/useFetchBatched');
jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => true,
}));
jest.mock('../../Utilities/hooks/useWorkspaceFeatureFlag');
jest.mock('../InventoryGroups/utils/api', () => ({
  __esModule: true,
  getGroups: () =>
    new Promise((resolve) =>
      resolve({
        total: 60,
      })
    ),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,

    usePermissionsWithContext: jest.fn(),
  })
);

describe('groups request not yet resolved', () => {
  beforeEach(() => {
    useFetchBatched.mockReturnValue({
      pageOffsetfetchBatched: () => new Promise(() => {}), // keep pending
    });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  it('initial values are empty', () => {
    const { result } = renderHook(() => useGroupFilter());

    const [, chips, value] = result.current;
    expect(chips.length).toBe(0);
    expect(value.length).toBe(0);
  });

  it('initial filter component is empty', () => {
    const { result } = renderHook(() => useGroupFilter());

    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          initialGroups={[]}
          selectedGroupNames={[]}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });
});

describe('with some groups available', () => {
  beforeEach(() => {
    useWorkspaceFeatureFlag.mockReturnValue(false);
  });

  const pageOffsetfetchBatched = jest.fn(
    () =>
      new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }]))
  );

  beforeAll(() => {
    useFetchBatched.mockReturnValue({
      pageOffsetfetchBatched,
    });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));
  });

  it('filter component updated with values', async () => {
    const { result } = renderHook(() => useGroupFilter());

    await waitFor(() => {
      expect(pageOffsetfetchBatched).toBeCalled();
    });
    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          initialGroups={
            [
              {
                "name": "group-1",
              },
              undefined,
            ]
          }
          selectedGroupNames={[]}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });

  it('can use setter', async () => {
    const { result } = renderHook(() => useGroupFilter());

    await waitFor(() => {
      expect(pageOffsetfetchBatched).toBeCalled();
    });
    const [, , , setValue] = result.current;
    act(() => {
      setValue(['group-1']);
    });
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual(['group-1']);
    expect(chips).toMatchObject([
      {
        category: 'Group',
        chips: [
          {
            name: 'group-1',
            value: 'group-1',
          },
        ],
        type: 'group_name',
      },
    ]);
  });

  it('can enable no group option', async () => {
    const { result } = renderHook(() => useGroupFilter(true));

    await waitFor(() => {
      expect(pageOffsetfetchBatched).toBeCalled();
    });
    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      {
        "children": <SearchableGroupFilter
          initialGroups={
            [
              {
                "name": "group-1",
              },
              undefined,
            ]
          }
          selectedGroupNames={[]}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={true}
        />,
      }
    `);
  });

  it('can select no group option', async () => {
    const { result } = renderHook(() => useGroupFilter());

    await waitFor(() => {
      expect(pageOffsetfetchBatched).toBeCalled();
    });
    const [, , , setValue] = result.current;
    act(() => {
      setValue(['']);
    });
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual(['']);
    expect(chips).toMatchObject([
      {
        category: 'Group',
        chips: [
          {
            name: 'No group',
            value: '',
          },
        ],
        type: 'group_name',
      },
    ]);
  });
});

describe('no groups:read permission', () => {
  const pageOffsetfetchBatched = jest.fn(
    () =>
      new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }]))
  );

  beforeAll(() => {
    useFetchBatched.mockReturnValue({
      pageOffsetfetchBatched,
    });
    usePermissionsWithContext.mockImplementation(() => ({ hasAccess: false }));
  });

  it('returns no groups', async () => {
    renderHook(() => useGroupFilter(true));

    await waitFor(
      () => {
        expect(pageOffsetfetchBatched).not.toBeCalled();
      },
      { timeout: 5000 }
    );
  });
});
