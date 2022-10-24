import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';
import { defaultColumns } from '../../../store/entities';

const isColumnEnabled = (key, disableColumns, showTags) =>
    (key === 'tags' && showTags) ||
    (key !== 'tags' && (Array.isArray(disableColumns) && !(disableColumns).includes(key)));

const useColumns = (columnsProp, disableDefaultColumns, showTags, columnsCounter) => {
    const columnsRedux = useSelector(
        ({ entities: { columns } }) => columns,
        (next, prev) => next.every(
            ({ key }, index) => prev.findIndex(({ key: prevKey }) => prevKey === key) === index
        )
    );
    const disabledColumns = Array.isArray(disableDefaultColumns) ? disableDefaultColumns : [];
    const defaultColumnsFiltered = useMemo(() => (disableDefaultColumns === true) ?
        [] : defaultColumns().filter(({ key }) =>
            isColumnEnabled(key, disabledColumns, showTags)
        ), [disabledColumns, disableDefaultColumns, showTags]);

    return useMemo(() => {
        if (typeof columnsProp === 'function') {
            return columnsProp(defaultColumns());
        } else if (columnsProp) {
            return mergeArraysByKey([
                defaultColumnsFiltered,
                columnsProp
            ], 'key');
        } else if (!columnsProp && columnsRedux) {
            return columnsRedux;
        }  else {
            return defaultColumnsFiltered;
        }
    }, [
        showTags,
        Array.isArray(disableDefaultColumns) ? disableDefaultColumns.join() : disableDefaultColumns,
        Array.isArray(columnsProp) ?
            columnsProp.map(({ key }) => key).join() :
            typeof columnsProp === 'function' ? 'function' : columnsProp,
        Array.isArray(columnsRedux) ? columnsRedux.map(({ key }) => key).join() : columnsRedux,
        columnsCounter
    ]);
};

export default useColumns;
