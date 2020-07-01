import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import {
    Table as PfTable,
    TableBody,
    TableHeader,
    TableGridBreakpoint,
    cellWidth,
    TableVariant,
    sortable,
    expandable,
    SortByDirection,
    classNames
} from '@patternfly/react-table/dist/esm';

export const asyncInventoryLoader = () => insights.loadInventory({
    React,
    reactRouterDom,
    pfReactTable: {
        Table: PfTable,
        TableBody,
        TableHeader,
        TableGridBreakpoint,
        cellWidth,
        TableVariant,
        sortable,
        expandable,
        SortByDirection,
        classNames
    }
});
