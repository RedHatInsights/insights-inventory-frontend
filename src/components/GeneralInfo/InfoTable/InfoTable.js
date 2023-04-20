import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Pagination,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import flatMap from 'lodash/flatMap';
import { prepareRows, filterRows, generateFilters, onDeleteFilter } from '../../../constants';

const InfoTable = ({ cells, rows, expandable, filters, onSort }) => {
    const [params, setParams] = useState({
        sortBy: { index: 0, direction: SortByDirection.asc },
        pagination: { page: 1, perPage: 10 },
        activeFilters: {}
    });
    const [opened, setOpened] = useState([]);

    const tirggerSort = (event, index, direction) => {
        onSort(event, expandable ? index - 1 : index, direction);
        setParams({
            ...params,
            sortBy: {
                index,
                direction
            }
        });
    };

    const onCollapse = (_event, index, isOpen) => {
        opened[index] = isOpen;
        setOpened({
            opened
        });
    };

    const onUpdatePagination = ({ page, perPage }) => {
        setParams({
            ...params,
            pagination: {
                ...params.pagination,
                page,
                perPage
            }
        });
    };

    const setFilter = (key, value, label) => {
        const { [key]: currFilter, ...restFilter } = params.activeFilters;
        setParams({
            ...params,
            activeFilters: {
                ...restFilter,
                ...value.length !== 0 && {
                    [key]: { key, value, label }
                }
            },
            pagination: { ...params.pagination, page: 1 }
        });
    };

    const triggerDeleteFilter = (_e, [deleted], deleteAll) => {
        setParams({
            ...params,
            activeFilters: onDeleteFilter(
                deleted,
                deleteAll,
                params.activeFilters
            ),
            pagination: { ...params.pagination, page: 1 }
        });
    };

    const { sortBy, pagination, activeFilters } = params;
    const collapsibleProps = expandable ? { onCollapse } : {};
    const activeRows = filterRows(rows, activeFilters);

    const mappedRows = expandable ? flatMap(
        prepareRows(activeRows, pagination),
        ({ child, ...row }, key) => [
            {
                ...row,
                isOpen: opened[key * 2] || false
            },
            {
                cells: [{ title: child }],
                parent: key * 2
            }
        ]) : prepareRows(activeRows, pagination);

    return (
        <Fragment>
            <PrimaryToolbar pagination={{
                ...pagination,
                itemCount: activeRows.length,
                onSetPage: (_e, page) => onUpdatePagination({ ...pagination, page }),
                onPerPageSelect: (_e, perPage) => onUpdatePagination({ ...pagination, page: 1, perPage })
            }}
            {...filters && {
                filterConfig: {
                    items: generateFilters(cells, filters, activeFilters, setFilter)
                }
            } }
            activeFiltersConfig={{
                filters: Object.values(activeFilters).map(filter => ({
                    ...filter,
                    category: filter.label,
                    chips: Array.isArray(filter.value) ? filter.value.map(item => ({ name: item })) : [{ name: filter.value }]
                })),
                onDelete: triggerDeleteFilter
            }}
            />
            {
                cells.length !== 1 ? <Table
                    aria-label="General information dialog table"
                    variant={ TableVariant.compact }
                    cells={ cells }
                    rows={ mappedRows }
                    sortBy={ {
                        ...sortBy,
                        index: expandable && sortBy.index === 0 ? 1 : sortBy.index
                    } }
                    onSort={ tirggerSort }
                    { ...collapsibleProps }
                >
                    <TableHeader />
                    <TableBody />
                </Table> :
                    <TextContent>
                        {
                            prepareRows(activeRows, pagination)
                            .map((row, key) => (
                                <Text component={ TextVariants.small } key={ key }>
                                    { row.title || row }
                                </Text>
                            ))
                        }
                    </TextContent>
            }
            <TableToolbar isFooter className="ins-c-inventory__table--toolbar">
                <Pagination
                    {...pagination}
                    itemCount={activeRows.length}
                    variant="bottom"
                    onSetPage={(_e, page) => onUpdatePagination({ ...pagination, page })}
                    onPerPageSelect={(_e, perPage) => onUpdatePagination({ ...pagination, page: 1, perPage })}
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
        })
      ),
    })
  ),
};
InfoTable.defaultProps = {
  cells: [],
  rows: [],
  onSort: () => undefined,
  sortBy: {},
  expandable: false,
};

export default InfoTable;
