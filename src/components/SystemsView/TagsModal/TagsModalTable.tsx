import React, { useState } from 'react';
import {
  DataView,
  DataViewTable,
  DataViewToolbar,
  useDataViewPagination,
} from '@patternfly/react-data-view';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import {
  Bullseye,
  Pagination,
  SearchInput,
  Spinner,
} from '@patternfly/react-core';
import { BulkSelect } from '../../BulkSelect';
import { System } from '../hooks/useSystemsQuery';
import { INITIAL_PAGE, PER_PAGE } from '../../../constants';
import { NO_HEADER } from '../../InventoryViews/constants';
import NoEntitiesFound from '../../InventoryTable/NoEntitiesFound';
import { Tbody, Td, Tr } from '@patternfly/react-table';
import {
  useBulkSelect,
  type DataViewBulkSelection,
} from '../hooks/useBulkSelect';
import {
  noopSelection,
  tagToTagTuple,
  TagTuple,
} from './tagsModalTableHelpers';

export interface TagsModalServerPagination {
  total: number;
  page: number;
  perPage: number;
  onSetPage: (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
    newPage: number,
  ) => void;
  onPerPageSelect: (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent | undefined,
    newPerPage: number,
  ) => void;
}

export interface TagsModalServerSearch {
  value: string;
  onChange: (value: string) => void;
}

interface TagsModalTableProps {
  tags: System['tags'];
  isLoading?: boolean;
  isError?: boolean;
  serverPagination?: TagsModalServerPagination;
  serverSearch?: TagsModalServerSearch;
  selection?: DataViewBulkSelection<TagTuple>;
}

export const TagsModalTable = ({
  tags = [],
  isLoading = false,
  isError = false,
  serverPagination,
  serverSearch,
  selection: selectionFromParent,
}: TagsModalTableProps) => {
  const [clientSearchValue, setClientSearchValue] = useState('');

  const hasSelectionEnabled = Boolean(selectionFromParent);
  const tagTuples: TagTuple[] = tags.map(tagToTagTuple);

  const searchInputValue = serverSearch?.value ?? clientSearchValue;

  const tagTuplesFiltered = serverSearch
    ? tagTuples
    : clientSearchValue
      ? tagTuples.filter((row) =>
          row.some((value) =>
            value.toLowerCase().includes(clientSearchValue.toLowerCase()),
          ),
        )
      : tagTuples;

  const clientPagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
  });

  const paginationForUi = serverPagination ?? clientPagination;
  const itemCount = serverPagination
    ? serverPagination.total
    : tagTuplesFiltered.length;

  const paginatedRows = serverPagination
    ? tagTuplesFiltered
    : tagTuplesFiltered.slice(
        (clientPagination.page - 1) * clientPagination.perPage,
        clientPagination.page * clientPagination.perPage,
      );

  const rows = paginatedRows;

  const { isPageSelected, isPartiallySelected, onBulkSelect, selectedCount } =
    useBulkSelect<TagTuple>(
      selectionFromParent
        ? {
            selection: selectionFromParent,
            rows: rows,
            total: itemCount,
          }
        : {
            selection: noopSelection,
            rows: [],
            total: 0,
          },
    );

  const resetPage = () => {
    paginationForUi.onSetPage(undefined, INITIAL_PAGE);
  };

  const onSearchChange = (value: string) => {
    if (serverSearch) {
      serverSearch.onChange(value);
    } else {
      setClientSearchValue(value);
      resetPage();
    }
  };

  const activeState = isError
    ? 'error'
    : isLoading
      ? 'loading'
      : tagTuplesFiltered.length === 0
        ? 'empty'
        : 'active';

  const columns = ['Name', 'Value', 'Tag source'];

  return (
    <DataView
      activeState={activeState}
      selection={hasSelectionEnabled ? selectionFromParent : undefined}
    >
      <DataViewToolbar
        data-testid="tags-table-header-toolbar"
        bulkSelect={
          selectionFromParent ? (
            <BulkSelect
              pageCount={rows.length}
              totalCount={itemCount}
              selectedCount={selectedCount}
              pagePartiallySelected={isPartiallySelected}
              pageSelected={isPageSelected}
              onSelect={onBulkSelect}
            />
          ) : undefined
        }
        pagination={
          <Pagination
            isCompact={true}
            itemCount={itemCount}
            {...paginationForUi}
          />
        }
        filters={
          <SearchInput
            aria-label="Tags search input"
            value={searchInputValue}
            onChange={(_event, value) => {
              onSearchChange(value);
            }}
            onClear={() => {
              onSearchChange('');
            }}
            placeholder="Filter tags"
          />
        }
      />
      <DataViewTable
        aria-label="Tags table"
        columns={columns}
        rows={rows}
        variant="compact"
        headStates={{
          empty: NO_HEADER,
          loading: NO_HEADER,
          error: NO_HEADER,
        }}
        bodyStates={{
          empty: (
            <Tbody>
              <Tr key="empty">
                <Td colSpan={columns.length}>
                  <NoEntitiesFound entities="tags" />
                </Td>
              </Tr>
            </Tbody>
          ),
          loading: (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ),
          error: (
            <ErrorState
              titleText="Unable to load tags"
              bodyText="There was an error retrieving tags. Check your connection and try again."
            />
          ),
        }}
      />
      <DataViewToolbar
        className="pf-v6-u-mt-lg"
        pagination={<Pagination itemCount={itemCount} {...paginationForUi} />}
      />
    </DataView>
  );
};

export default TagsModalTable;
