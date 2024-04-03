import { act, renderHook } from '@testing-library/react';
import { useTagsFilter } from './useTagsFilter';

describe('useTagsFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() =>
      useTagsFilter(
        [
          {
            name: 'something',
            tags: [
              {
                count: 10,
                tag: { key: 'test', value: 'something' },
              },
            ],
          },
        ],
        true,
        0
      )
    );
    const filter = result.current.tagsFilter;

    expect(filter).toMatchObject({
      label: 'Tags',
      value: 'tags',
      type: 'group',
    });
    expect(filter.filterValues.selected).toMatchObject({});
    expect(filter.filterValues.filterBy).toBe('');
    expect(filter.filterValues.groups).toMatchObject([
      {
        items: [
          {
            meta: {
              count: 10,
              tag: { key: 'test', value: 'something' },
            },
            value: 'test=something',
          },
        ],
        label: 'something',
        type: 'checkbox',
        value: 'something',
      },
    ]);
  });

  it('should create loading filter', () => {
    const { result } = renderHook(() => useTagsFilter([], false, 0));
    const filter = result.current.tagsFilter;

    expect(filter).toMatchObject({
      label: 'Tags',
      value: 'tags',
      type: 'group',
    });
    expect(filter.filterValues.selected).toMatchObject({});
    expect(filter.filterValues.filterBy).toBe('');
    expect(filter.filterValues.items).toMatchObject([
      {
        isDisabled: true,
        className: 'ins-c-tagfilter__tail',
      },
    ]);
  });

  it('should create chip', () => {
    const { result } = renderHook(() =>
      useTagsFilter(
        [
          {
            name: 'something',
            tags: [
              {
                count: 10,
                tag: { key: 'test', value: 'something' },
              },
            ],
          },
        ],
        true,
        0
      )
    );

    const setValue = result.current.setSelectedTags;

    act(() => {
      setValue({
        something: {
          test: {
            group: {
              label: 'something',
            },
            isSelected: true,
            item: {
              meta: {
                tag: {
                  value: 'test',
                  key: 'test',
                },
              },
            },
          },
        },
      });
    });

    const chip = result.current.tagsChip;
    const value = result.current.tagsFilter.filterValues.selected;

    expect(value.something.test.isSelected).toBe(true);
    expect(chip).toMatchObject([
      {
        type: 'tags',
        key: 'something',
        category: 'something',
      },
    ]);
    expect(chip[0].chips).toMatchObject([
      {
        group: { label: 'something' },
        key: 'test',
        name: 'test=test',
        tagKey: 'test',
        value: 'test',
      },
    ]);
  });

  it('should change filtered by', () => {
    const { result } = renderHook(() =>
      useTagsFilter(
        [
          {
            name: 'something',
            tags: [
              {
                count: 10,
                tag: { key: 'test', value: 'something' },
              },
            ],
          },
        ],
        true,
        0
      )
    );

    act(() => {
      result.current.seFilterTagsBy('test');
    });
    expect(result.current.filterTagsBy).toBe('test');
  });

  it('should call show more', () => {
    const showMore = jest.fn();

    const { result } = renderHook(() =>
      useTagsFilter(
        [
          {
            name: 'something',
            tags: [
              {
                count: 10,
                tag: { key: 'test', value: 'something' },
              },
            ],
          },
        ],
        true,
        10,
        showMore
      )
    );

    act(() => {
      result.current.tagsFilter.filterValues.onShowMore();
    });
    expect(showMore).toHaveBeenCalled();
  });
});
