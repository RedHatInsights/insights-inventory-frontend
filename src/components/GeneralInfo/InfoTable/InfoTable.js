import React, { Fragment, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@patternfly/react-core';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import { SortByDirection, TableVariant } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import flatMap from 'lodash/flatMap';
import { filterRows, generateFilters, prepareRows } from '../../../constants';

const InfoTable = ({
  cells = [],
  rows = [],
  expandable = false,
  filters,
  onSort = undefined,
}) => {
  // States
  const [sortBy, setSortBy] = useState({
    index: 0,
    direction: SortByDirection.asc,
  });
  const [opened, setOpened] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [activeFilters, setActiveFilters] = useState({});

  // Memo
  const activeRows = useMemo(
    () => filterRows(rows, activeFilters),
    [rows, activeFilters],
  );

  const mappedRows = useMemo(
    () =>
      expandable
        ? flatMap(
            prepareRows(activeRows, pagination),
            ({ child, ...row }, key) => [
              {
                ...row,
                isOpen: opened[key * 2] || false,
              },
              {
                cells: [{ title: child }],
                parent: key * 2,
              },
            ],
          )
        : prepareRows(activeRows, pagination),
    [activeRows, pagination, expandable, opened],
  );

  // Handlers
  const handleSort = useCallback(
    (event, index, direction) => {
      if (onSort) {
        onSort(
          event,
          expandable ? index - 1 : index,
          direction,
          undefined,
          expandable ? 1 : 0,
        );
      }
      setSortBy({ index, direction });
    },
    [expandable, onSort],
  );

  const onCollapse = (_event, index, isOpen) => {
    setOpened((prevOpened) => {
      const newOpened = [...prevOpened];
      opened[index] = isOpen;
      return newOpened;
    });
  };

  const onUpdatePagination = ({ page, perPage }) => {
    setPagination({ page, perPage });
  };

  const setFilter = (key, value, label) => {
    setActiveFilters((prevFilters) => {
      const { [key]: currFilter, ...restFilter } = prevFilters;
      return {
        ...restFilter,
        ...(value.length !== 0 && {
          [key]: { key, value, label },
        }),
      };
    });
    setPagination((prevPagination) => ({ ...prevPagination, page: 1 }));
  };

  const onDeleteFilter = (_e, [deleted], deleteAll) => {
    setActiveFilters((prevFilters) => {
      if (deleteAll) {
        return {};
      }
      const { [deleted.key]: _, ...restFilters } = prevFilters;
      return restFilters;
    });
    setPagination((prevPagination) => ({ ...prevPagination, page: 1 }));
  };

  return (
    <Fragment>
      <PrimaryToolbar
        pagination={{
          ...pagination,
          itemCount: activeRows.length || 0,
          onSetPage: (_e, page) => onUpdatePagination({ ...pagination, page }),
          onPerPageSelect: (_e, perPage) =>
            onUpdatePagination({ ...pagination, page: 1, perPage }),
          titles: {
            optionsToggleAriaLabel: 'Items per page',
          },
        }}
        {...(filters && {
          filterConfig: {
            items: generateFilters(cells, filters, activeFilters, setFilter),
          },
        })}
        activeFiltersConfig={{
          filters: Object.values(activeFilters).map((filter) => ({
            ...filter,
            category: filter.label,
            chips: Array.isArray(filter.value)
              ? filter.value.map((item) => ({ name: item }))
              : [{ name: filter.value || '' }],
          })),
          onDelete: onDeleteFilter,
          deleteTitle: 'Reset filters',
        }}
      />
      <Table
        aria-label="General information dialog table"
        variant={TableVariant.compact}
        cells={cells}
        rows={mappedRows}
        sortBy={{
          ...sortBy,
          index: expandable && sortBy.index === 0 ? 1 : sortBy.index,
        }}
        onSort={handleSort}
        {...(expandable && { onCollapse })}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <TableToolbar isFooter className="ins-c-inventory__table--toolbar">
        <Pagination
          {...pagination}
          itemCount={activeRows.length || 0}
          variant="bottom"
          onSetPage={(_e, page) => onUpdatePagination({ ...pagination, page })}
          onPerPageSelect={(_e, perPage) =>
            onUpdatePagination({ ...pagination, page: 1, perPage })
          }
          titles={{
            optionsToggleAriaLabel: 'Items per page',
          }}
        />
      </TableToolbar>
    </Fragment>
  );
};

InfoTable.propTypes = {
  rows: PropTypes.array,
  cells: PropTypes.array,
  onSort: PropTypes.func,
  expandable: PropTypes.bool,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      title: PropTypes.string,
      type: PropTypes.oneOf(['text', 'checkbox', 'radio', 'group']),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
          label: PropTypes.node,
        }),
      ),
    }),
  ),
};

export default InfoTable;
