/* eslint-disable camelcase */
import { waitFor } from '@testing-library/react';
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

describe('some groups available', () => {
  beforeAll(() => {
    useFetchBatched.mockReturnValue({
      fetchBatched: () =>
        new Promise((resolve) => resolve([{ results: [{ name: 'group-1' }] }])),
    });
  });

  it('correct initial values', async () => {
    const { result } = renderHook(() => useGroupFilter());

    await waitFor(() => {
      const [config, chips, value] = result.all[0];
      expect(chips.length).toBe(0);
      expect(value.length).toBe(0);
      expect(config.filterValues.children).toMatchInlineSnapshot(`
        <SearchableGroupFilter
          initialGroups={Array []}
          selectedGroupNames={Array []}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={false}
        />
      `);
    });
  });

  it('component is updated', async () => {
    const { result } = renderHook(() => useGroupFilter());

    await waitFor(() => {
      const [config] = result.all[1];

      expect(config.filterValues.children).toMatchInlineSnapshot(`
        <SearchableGroupFilter
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
        />
      `);
    });
  });

  it('can use setter', async () => {
    const { result } = renderHook(useGroupFilter);
    const [, , , setValue] = result.current;

    act(() => {
      setValue(['group-1']);
    });

    const [, chips, value] = result.current;

    await waitFor(() => {
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
  });

  it('can enable no group option', async () => {
    const { result } = renderHook(() => useGroupFilter(true));

    await waitFor(() => {
      const [config] = result.current;
      expect(config.filterValues.children).toMatchInlineSnapshot(`
        <SearchableGroupFilter
          initialGroups={Array []}
          selectedGroupNames={Array []}
          setSelectedGroupNames={[Function]}
          showNoGroupOption={true}
        />
      `);
    });
  });

  it('can select no group option', async () => {
    const { result } = renderHook(useGroupFilter);
    const [, , , setValue] = result.current;

    act(() => {
      setValue(['']);
    });

    const [, chips, value] = result.current;

    await waitFor(() => {
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
});
