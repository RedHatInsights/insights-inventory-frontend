import React from 'react';
import { cellWidth, sortable, expandable } from '@patternfly/react-table';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import TitleColumn from './TitleColumn';
import { Fragment } from 'react';
import { Skeleton } from '@patternfly/react-core';

export const buildCells = (item, columns, extra) => {
    return columns.map(({ key, composed, renderFunc }) => {
        // eslint-disable-next-line new-cap
        const data = composed ? <Fragment>{TitleColumn(
            composed.map(key => get(item, key, ' ')),
            item.id,
            item,
            extra
        )}</Fragment> : get(item, key, ' ');
        return renderFunc ? <Fragment>{ renderFunc(data, item.id, item, extra) }</Fragment> : data;
    });
};

//returns an array of objects representing rows for a table.
//The function takes three parameters: "rows", "columns", and an object with several optional properties.
//The "rows" parameter is an array of objects, where each object represents a single row.
//The "columns" parameter is also an array of objects, where each object represents a single column in the table.
//The third parameter is an object with several optional properties, including "actions",
//"expandable", "noSystemsTable", and "extra". These properties are destructured from
//the object using object destructuring syntax.
export const createRows = (rows = [], columns = [], { actions, expandable, noSystemsTable, ...extra } = {}) => {
    if (rows.length === 0) {
        return [{
            cells: [{
                title: noSystemsTable,
                props: {
                    colSpan: columns.length + Boolean(actions),
                    dataLabel: null
                }
            }]
        }];
    }

    //If the "rows" parameter is not empty, the function maps over each row object in the "rows"
    //array and creates an array of two objects for each row. The first object represents the
    //row itself and contains the "cells" property, which is an array of objects representing
    //each cell in the row. The "actionProps" property is also set to an object containing the
    //"data-ouia-component-id" property, which is set to a string combining the row's "id" property
    //and the string "-actions-kebab".
    return flatten(rows.map((oneItem, key) => ([{
        ...oneItem,
        ...oneItem.children && expandable && { isOpen: !!oneItem.isOpen },
        cells: buildCells(oneItem, columns, extra),
        actionProps: {
            'data-ouia-component-id': `${oneItem.id}-actions-kebab`
        }
    },
    //The second object represents the child row, which is only created if the "expandable"
    //property is set to true and the row has a "children" property. This object has the
    //"cells" property set to an array containing a single object representing the cell
    //in the row. The "parent" property is set to the index of the parent row multiplied by 2,
    //and the "fullWidth" property is set to true.
    oneItem.children && expandable && {
        cells: [
            {
                title: typeof oneItem.children === 'function' ? oneItem.children() : oneItem.children
            }
        ],
        parent: key * 2,
        fullWidth: true
    }]))).filter(Boolean);
};

export const onDeleteFilter = (deleted, currFilter = []) => {
    const { value: deletedItem } = deleted?.chips?.[0] || {};
    return  currFilter.filter((item) => item !== deletedItem);
};

export const onDeleteTag = (deleted, selectedTags, onApplyTags) => {
    const deletedItem = deleted?.chips?.[0];
    if (selectedTags?.[deleted?.key]?.[deletedItem?.key] !== undefined) {
        selectedTags[deleted?.key][deletedItem?.key] = false;
    }

    onApplyTags && onApplyTags(selectedTags, false);
    return selectedTags;
};

const includesSortable = (transforms) => transforms?.reduce((acc, fn) => acc || fn.toString().includes('onSort:'), false);

export const createColumns = (columns, hasItems, rows, isExpandable) => (
    columns?.map(({ props, transforms, cellFormatters, ...oneCell }) => ({
        ...oneCell,
        transforms: [
            ...transforms || [],
            ...props?.width ? [cellWidth(props.width)] : [],
            ...hasItems ||
            rows.length <= 0 ||
            (props && props.isStatic) ||
            transforms?.includes(sortable) ||
            includesSortable(transforms) ? [] : [sortable]
        ],
        cellFormatters: [
            ...cellFormatters || [],
            ...isExpandable ? [expandable] : []
        ]
    }))
);

export const generateLoadingRows = (colsNumber, rowsNumber) =>
    Array(rowsNumber).fill({
        fullWidth: true,
        cells: Array(colsNumber).fill({ title: <Skeleton /> })
    });
