import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import useColumns from './useColumns';
import { DEFAULT_COLUMNS } from '../../../store/entities';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';
import { renderHook } from '@testing-library/react';

const mockStore = configureStore([]);

describe('useColumns', () => {
  let store;

  const wrapper = ({ children, store }) => (
    <Provider store={store}>{children}</Provider>
  );

  beforeEach(() => {
    store = mockStore({
      entities: {
        columns: DEFAULT_COLUMNS,
      },
    });
  });

  it('should return columns from columnsProp function if provided', () => {
    const columnsProp = jest.fn().mockReturnValue([{ key: 'foo' }]);
    const { result } = renderHook(
      () =>
        useColumns(columnsProp, {
          disableDefaultColumns: false,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: null,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    expect(columnsProp).toHaveBeenCalledWith(DEFAULT_COLUMNS);
    expect(result.current).toEqual([{ key: 'foo' }]);
  });

  it('should merge default columns with columnsProp array', () => {
    const customColumns = [{ key: 'foo' }, { key: 'bar' }];
    const { result } = renderHook(
      () =>
        useColumns(customColumns, {
          disableDefaultColumns: false,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: null,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    const expected = mergeArraysByKey([DEFAULT_COLUMNS, customColumns], 'key');
    expect(result.current).toEqual(expected);
  });

  it('should use columns from Redux if no columnsProp provided', () => {
    const { result } = renderHook(
      () =>
        useColumns(undefined, {
          disableDefaultColumns: false,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: null,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    expect(result.current).toEqual(DEFAULT_COLUMNS);
  });

  it('should use filtered default columns if no columnsProp and no redux columns', () => {
    store = mockStore({
      entities: {
        columns: null,
      },
    });

    const { result } = renderHook(
      () =>
        useColumns(undefined, {
          disableDefaultColumns: false,
          showTags: false,
          columnsCounter: 0,
          lastSeenOverride: null,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    const expected = DEFAULT_COLUMNS.filter(({ key }) => key !== 'tags');
    expect(result.current).toEqual(expected);
  });

  it('should disable all default columns if disableDefaultColumns === true', () => {
    const { result } = renderHook(
      () =>
        useColumns(DEFAULT_COLUMNS, {
          disableDefaultColumns: true,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: null,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    expect(result.current).toEqual(DEFAULT_COLUMNS);
  });

  it('should replace lastSeenOverride key if provided with disableDefaultColumns = true', () => {
    const overrideKey = 'last_seen_custom';
    const { result } = renderHook(
      () =>
        useColumns(DEFAULT_COLUMNS, {
          disableDefaultColumns: true,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: overrideKey,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    const updatedColumns = DEFAULT_COLUMNS.map((col) =>
      col.key === 'updated'
        ? { ...col, key: overrideKey, sortKey: overrideKey }
        : col,
    );
    expect(result.current).toEqual(updatedColumns);
  });

  it('should replace lastSeenOverride key if provided with disableDefaultColumns = false', () => {
    const overrideKey = 'last_seen_custom';
    const { result } = renderHook(
      () =>
        useColumns(DEFAULT_COLUMNS, {
          disableDefaultColumns: false,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: overrideKey,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    const updatedColumns = DEFAULT_COLUMNS.map((col) =>
      col.key === 'updated'
        ? { ...col, key: overrideKey, sortKey: overrideKey }
        : col,
    );
    expect(result.current).toEqual(updatedColumns);
  });

  it('should replace lastSeenOverride key if provided with disableDefaultColumns = false and columnProp not provided', () => {
    const overrideKey = 'last_seen_custom';
    const { result } = renderHook(
      () =>
        useColumns(null, {
          disableDefaultColumns: false,
          showTags: true,
          columnsCounter: 0,
          lastSeenOverride: overrideKey,
        }),
      { wrapper: (props) => wrapper({ ...props, store }) },
    );

    const updatedColumns = DEFAULT_COLUMNS.map((col) =>
      col.key === 'updated'
        ? { ...col, key: overrideKey, sortKey: overrideKey }
        : col,
    );
    expect(result.current).toEqual(updatedColumns);
  });
});
