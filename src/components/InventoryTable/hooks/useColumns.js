import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';
import { DEFAULT_COLUMNS } from '../../../store/entities';
import isEqual from 'lodash/isEqual';

const renameColumnKey = (col, oldKey, newKey) =>
  col.key === oldKey ? { ...col, key: newKey, sortKey: newKey } : col;

const isColumnEnabled = (key, disableColumns, showTags) =>
  (key === 'tags' && showTags) ||
  (key !== 'tags' &&
    Array.isArray(disableColumns) &&
    !disableColumns.includes(key));

const useColumns = (
  columnsProp,
  { disableDefaultColumns, showTags, columnsCounter, lastSeenOverride },
) => {
  const columnsRedux = useSelector(
    ({ entities: { columns } }) => columns,
    isEqual,
  );
  const disabledColumns = Array.isArray(disableDefaultColumns)
    ? disableDefaultColumns
    : [];

  const lastSeenOverrider = (col) =>
    lastSeenOverride ? renameColumnKey(col, 'updated', lastSeenOverride) : col;

  const defaultColumnsFiltered = useMemo(
    () =>
      disableDefaultColumns === true
        ? []
        : DEFAULT_COLUMNS.filter(({ key }) =>
            isColumnEnabled(key, disabledColumns, showTags),
          ).map(lastSeenOverrider),
    [disabledColumns, disableDefaultColumns, showTags, lastSeenOverride],
  );

  return useMemo(() => {
    if (typeof columnsProp === 'function') {
      return columnsProp(DEFAULT_COLUMNS);
    } else if (columnsProp) {
      const columnsPropFiltered = columnsProp.map(lastSeenOverrider);
      return mergeArraysByKey(
        [defaultColumnsFiltered, columnsPropFiltered],
        'key',
      );
    } else if (!columnsProp && columnsRedux) {
      return columnsRedux.map(lastSeenOverrider);
    } else {
      return defaultColumnsFiltered;
    }
  }, [
    columnsProp,
    showTags,
    Array.isArray(disableDefaultColumns)
      ? disableDefaultColumns.join()
      : disableDefaultColumns,
    Array.isArray(columnsProp)
      ? columnsProp.map(({ key }) => key).join()
      : typeof columnsProp === 'function'
        ? 'function'
        : columnsProp,
    Array.isArray(columnsRedux)
      ? columnsRedux.map(({ key }) => key).join()
      : columnsRedux,
    columnsCounter,
    lastSeenOverride,
  ]);
};

export default useColumns;
