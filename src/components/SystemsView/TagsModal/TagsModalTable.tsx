import React, { useState } from 'react';
import {
  DataView,
  DataViewTable,
  DataViewToolbar,
  useDataViewPagination,
} from '@patternfly/react-data-view';
import { Pagination, SearchInput } from '@patternfly/react-core';
import { System } from '../hooks/useSystemsQuery';
import { INITIAL_PAGE, PER_PAGE } from '../../../constants';
import { NO_HEADER } from '../../InventoryViews/constants';
import NoEntitiesFound from '../../InventoryTable/NoEntitiesFound';
import { Tbody, Td, Tr } from '@patternfly/react-table';

type TagValues = [string, string, string];
interface TagsModalTableProps {
  tags: System['tags'];
}

export const TagsModalTable = ({ tags = [] }: TagsModalTableProps) => {
  const [searchValue, setSearchValue] = useState('');

  const rows: TagValues[] = tags.map((tag) => [
    tag.key ?? '',
    tag.value ?? '',
    tag.namespace ?? '',
  ]);

  const filteredRows = searchValue
    ? rows.filter((row) =>
        row.some((value) =>
          value.toLowerCase().includes(searchValue.toLowerCase()),
        ),
      )
    : rows;

  const activeState = filteredRows.length === 0 ? 'empty' : 'active';
  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
  });
  const paginatedRows = filteredRows.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage,
  );

  const columns = ['Name', 'Value', 'Tag source'];
  const ouiaId = 'tags-modal-table';
  debugger;
  return (
    <DataView activeState={activeState}>
      <DataViewToolbar
        ouiaId="tags-table-header"
        pagination={
          <Pagination
            isCompact={true}
            itemCount={filteredRows.length}
            {...pagination}
          />
        }
        filters={
          // Simple input here, rather than DataViewFilter so we don't get chips
          <SearchInput
            aria-label="Tags search input"
            value={searchValue}
            onChange={(_event, value) => {
              setSearchValue(value);
              pagination.onSetPage(undefined, INITIAL_PAGE);
            }}
            onClear={() => {
              setSearchValue('');
              pagination.onSetPage(undefined, INITIAL_PAGE);
            }}
            placeholder="Filter tags"
          />
        }
      />
      <DataViewTable
        aria-label="Tags table"
        ouiaId={ouiaId}
        columns={columns}
        rows={paginatedRows}
        variant="compact"
        headStates={{
          empty: NO_HEADER,
          loading: NO_HEADER,
          error: NO_HEADER,
        }}
        bodyStates={{
          empty: (
            <Tbody>
              <Tr key="empty" ouiaId={`${ouiaId}-tr-empty`}>
                <Td colSpan={columns.length}>
                  <NoEntitiesFound entities="tags" />
                </Td>
              </Tr>
            </Tbody>
          ),
        }}
      />
      <DataViewToolbar
        ouiaId="tags-table-footer"
        className="pf-v6-u-mt-lg"
        pagination={
          <Pagination itemCount={filteredRows.length} {...pagination} />
        }
      />
    </DataView>
  );
};

export default TagsModalTable;
