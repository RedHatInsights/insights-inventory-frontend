import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import * as ReactRedux from 'react-redux';
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
import { reactCore } from '@redhat-cloud-services/frontend-components-utilities/files/inventoryDependencies';

export const asyncInventoryLoader = () => insights.loadInventory({
    ReactRedux,
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
    },
    pfReact: reactCore
});
