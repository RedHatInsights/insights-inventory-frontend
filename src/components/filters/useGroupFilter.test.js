import { act, renderHook } from '@testing-library/react-hooks/dom';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import useGroupFilter from './useGroupFilter';

jest.mock('../../Utilities/hooks/useFetchBatched');
jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => true,
}));
jest.mock('../InventoryGroups/utils/api', () => ({
  __esModule: true,
  getGroups: () =>
    new Promise((resolve) =>
      resolve({
        total: 10,
      })
    ),
}));

describe('with some groups available', () => {
  beforeAll(() => {
    useFetchBatched.mockReturnValue({
      fetchBatched: () =>
        new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }])),
    });
  });

  it('initial values are empty', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGroupFilter());

    await waitForNextUpdate();
    const [, chips, value] = result.all[0];
    expect(chips.length).toBe(0);
    expect(value.length).toBe(0);
  });

  it('initial filter component is empty', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGroupFilter());

    await waitForNextUpdate();
    const [config] = result.all[0];
    expect(config.filterValues).toMatchInlineSnapshot(`
      Object {
        "children": <SearchableGroupFilter
          initialGroups={Array []}
          selectedGroupNames={Array []}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });

  it('filter component updated with values', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGroupFilter());

    await waitForNextUpdate();
    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      Object {
        "children": <SearchableGroupFilter
          initialGroups={
            Array [
              Object {
                "name": "group-1",
              },
            ]
          }
          selectedGroupNames={Array []}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />,
      }
    `);
  });

  it('can use setter', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGroupFilter());

    const [, , , setValue] = result.current;
    act(() => {
      setValue(['group-1']);
    });
    await waitForNextUpdate();
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual(['group-1']);
    expect(chips).toMatchInlineSnapshot(`
        Array [
          Object {
            "category": "Group",
            "chips": Array [
              Object {
                "name": "group-1",
                "value": "group-1",
              },
            ],
            "type": "group_name",
          },
        ]
      `);
  });

  it('can enable no group option', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGroupFilter(true)
    );

    await waitForNextUpdate();
    const [config] = result.current;
    expect(config.filterValues).toMatchInlineSnapshot(`
      Object {
        "children": <SearchableGroupFilter
          initialGroups={
            Array [
              Object {
                "name": "group-1",
              },
            ]
          }
          selectedGroupNames={Array []}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={true}
        />,
      }
    `);
  });

  it('can select no group option', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGroupFilter());

    const [, , , setValue] = result.current;
    act(() => {
      setValue(['']);
    });
    await waitForNextUpdate();
    const [, chips, value] = result.current;
    expect(chips.length).toBe(1);
    expect(value).toEqual(['']);
    expect(chips).toMatchInlineSnapshot(`
        Array [
          Object {
            "category": "Group",
            "chips": Array [
              Object {
                "name": "No group",
                "value": "",
              },
            ],
            "type": "group_name",
          },
        ]
      `);
  });
});
