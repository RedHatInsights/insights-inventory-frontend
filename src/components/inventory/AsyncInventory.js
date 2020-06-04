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
    SortByDirection
} from '@patternfly/react-table';

export const asyncInventoryLoader = () => insights.loadInventory({
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
        SortByDirection
    }
});
