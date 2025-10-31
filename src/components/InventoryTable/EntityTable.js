import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { selectEntity, changeSort } from '../../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { TableGridBreakpoint, TableVariant } from '@patternfly/react-table';
import {
  Table as PfTable,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components/SkeletonTable';
import NoEntitiesFound from './NoEntitiesFound';
import { createColumns, createRows } from './helpers';
import useColumns from './hooks/useColumns';

/**
 * The actual (PF)table component. It calculates each cell and every table property.
 * It uses rows, columns and loaded from redux to show correct data.
 * When row is selected `selectEntity` is dispatched.
 *  @param   {object}          props                       all props used in this component.
 *  @param   {boolean}         props.hasItems              if true, the items are loaded
 *  @param   {boolean}         props.expandable            if true, the expandable is enabled
 *  @param   {Function}        props.onExpandClick         on expand click function
 *  @param   {boolean}         props.hasCheckbox           if true, the checkbox is enabled
 *  @param   {Array}           props.actions               actions array for the table
 *  @param   {string}          props.variant               variant of the table
 *  @param   {object}          props.sortBy                sort by object
 *  @param   {object}          props.tableProps            table props object
 *  @param   {Function}        props.onSort                on sort function
 *  @param   {Function}        props.onRowClick            on row click function
 *  @param   {boolean}         props.noDetail              if true, the no detail is enabled
 *  @param   {React.node}      props.noSystemsTable        no systems table node
 *  @param   {boolean}         props.showTags              if true, the tags are shown
 *  @param   {Array}           props.columns               columns array
 *  @param   {boolean}         props.disableDefaultColumns if true, the default columns are disabled
 *  @param   {boolean}         props.loaded                if true, the loaded is true
 *  @param   {number}          props.columnsCounter        columns counter
 *  @param   {string}          props.lastSeenOverride      last seen override
 *  @returns {React.ReactNode}                             the table component
 */
const EntityTable = ({
  hasItems,
  expandable = false,
  onExpandClick = () => undefined,
  hasCheckbox = true,
  actions,
  variant = TableVariant.compact,
  sortBy,
  tableProps = {},
  onSort,
  onRowClick,
  noDetail,
  noSystemsTable = <NoEntitiesFound />,
  showTags,
  columns: columnsProp,
  disableDefaultColumns,
  loaded = false,
  columnsCounter,
  lastSeenOverride,
}) => {
  const isExpandable = expandable;
  const dispatch = useDispatch();
  const columns = useColumns(columnsProp, {
    disableDefaultColumns,
    showTags,
    columnsCounter,
    lastSeenOverride,
  });
  const rows = useSelector(({ entities: { rows } }) => rows);
  const onItemSelect = (_event, checked, rowId) => {
    const row = isExpandable ? rows[rowId / 2] : rows[rowId];
    dispatch(selectEntity(rowId === -1 ? 0 : row.id, checked));
  };

  const onSortChange = (_event, key, direction, index) => {
    if (key !== 'action' && key !== 'health') {
      dispatch(changeSort({ index, key, direction: direction?.toLowerCase() }));
    }

    onSort?.({ index, key, direction });
  };

  const cells = useMemo(
    () => loaded && createColumns(columns, hasItems, rows, isExpandable),
    [loaded, columns, hasItems, rows, isExpandable],
  );

  const tableSortBy = {
    index:
      columns?.findIndex(
        (item) =>
          sortBy?.key === item.key ||
          // Inventory API has different sort key for some columns
          (sortBy?.key === 'operating_system' &&
            item.key === 'system_profile') ||
          (sortBy?.key === 'group_name' && item.key === 'groups'),
      ) +
      Boolean(hasCheckbox) +
      Boolean(expandable),
    direction: sortBy?.direction,
  };

  const modifiedTableProps = useMemo(() => {
    const { RowWrapper, ...withoutRowWrapper } = tableProps;
    if (rows?.length === 0) {
      const { actionResolver, ...filteredTableProps } = withoutRowWrapper;

      return filteredTableProps;
    }
    return withoutRowWrapper;
  }, [rows, tableProps]);

  return (
    <React.Fragment>
      {loaded && cells ? (
        PfTable && (
          <PfTable
            variant={variant}
            aria-label="Host inventory"
            data-ouia-component-id="systems-table"
            cells={cells}
            rows={createRows(rows, columns, {
              actions,
              expandable,
              loaded,
              onRowClick,
              noDetail,
              sortBy,
              noSystemsTable,
            })}
            gridBreakPoint={
              columns?.length > 5
                ? TableGridBreakpoint.gridLg
                : TableGridBreakpoint.gridMd
            }
            className="ins-c-entity-table sentry-mask data-hj-suppress"
            onSort={(event, index, direction) => {
              onSortChange(
                event,
                cells?.[index - Boolean(hasCheckbox) - Boolean(expandable)]
                  ?.sortKey ||
                  cells?.[index - Boolean(hasCheckbox) - Boolean(expandable)]
                    ?.key,
                direction,
                index,
              );
            }}
            sortBy={tableSortBy}
            {...{
              ...(hasCheckbox && rows?.length !== 0
                ? { onSelect: onItemSelect }
                : {}),
              ...(expandable ? { onCollapse: onExpandClick } : {}),
              ...(actions && rows?.length > 0 && { actions }),
            }}
            isStickyHeader
            {...modifiedTableProps}
          >
            <TableHeader />
            <TableBody />
          </PfTable>
        )
      ) : (
        <SkeletonTable
          columns={columns.map(({ title, dataLabel }) => dataLabel || title)}
          rows={15}
          variant={variant ?? modifiedTableProps.variant}
        />
      )}
    </React.Fragment>
  );
};

EntityTable.propTypes = {
  variant: PropTypes.oneOf(['compact']),
  expandable: PropTypes.bool,
  onExpandClick: PropTypes.func,
  onSort: PropTypes.func,
  hasCheckbox: PropTypes.bool,
  hasItems: PropTypes.bool,
  sortBy: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  tableProps: PropTypes.shape({
    [PropTypes.string]: PropTypes.any,
    RowWrapper: PropTypes.elementType,
    variant: PropTypes.string,
    actionResolver: PropTypes.func,
  }),
  onRowClick: PropTypes.func,
  showTags: PropTypes.bool,
  noSystemsTable: PropTypes.node,
  disableDefaultColumns: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  loaded: PropTypes.bool,
  columnsCounter: PropTypes.number,
  columns: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  isLoaded: PropTypes.bool,
  actions: PropTypes.array,
  noDetail: PropTypes.any,
  lastSeenOverride: PropTypes.string,
};

export default EntityTable;
