import {
  DataView,
  DataViewTable,
  DataViewTh,
  DataViewTr,
} from '@patternfly/react-data-view';
import React from 'react';
import { useRows } from './hooks/useRows';
import { NO_HEADER } from '../constants';
import NoEntitiesFound from '../../InventoryTable/NoEntitiesFound';
import { ErrorState } from '@patternfly/react-component-groups';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useImageQueries } from './hooks/useImageQueries';
import './ImagesView.scss';

/**
 * Images view: tree table of bootc (image-based) systems
 *
 * @remarks Previously implemented as BifrostPage
 *  @returns The Images view DataView (loading, error, empty, or table).
 */
export const ImagesView = () => {
  const queryResults = useImageQueries();
  const [bootcResults, packageBasedResults, edgeResults] = queryResults;
  const isLoading = queryResults.some((r) => r.isLoading);
  const isError = queryResults.some((r) => r.isError);

  const activeState = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : bootcResults?.data?.length === 0
        ? 'empty'
        : 'active';

  const columnNames: string[] = ['', 'Image name', 'Hash commits', 'Systems'];
  const columns: DataViewTh[] = columnNames.map((name) => ({
    cell: name,
    props: {},
  }));

  const rows: DataViewTr[] = useRows({
    bootcSystems: bootcResults.data,
    packageBasedData: packageBasedResults.data,
    edgeData: edgeResults.data,
    columnNames,
  });

  return (
    <DataView activeState={activeState}>
      <DataViewTable
        ouiaId="images-view-table"
        columns={columns}
        rows={rows}
        headStates={{
          loading: NO_HEADER,
          empty: NO_HEADER,
          error: NO_HEADER,
        }}
        bodyStates={{
          loading: (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ),
          empty: <NoEntitiesFound entities="images" />,
          error: (
            <ErrorState
              ouiaId="error-state"
              titleText="Unable to load data"
              bodyText="There was an error retrieving data. Check your connection and reload the page."
            />
          ),
        }}
      />
    </DataView>
  );
};
