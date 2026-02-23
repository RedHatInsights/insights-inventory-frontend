import {
  DataViewTable,
  DataViewTh,
  DataViewTrTree,
} from '@patternfly/react-data-view';
import { DataView } from '@patternfly/react-data-view';
import React from 'react';
import { useRows } from './hooks/useRows';
import { NO_HEADER } from '../constants';
import NoEntitiesFound from '../../InventoryTable/NoEntitiesFound';
import { ErrorState } from '@patternfly/react-component-groups';
import { Bullseye, Spinner } from '@patternfly/react-core';
import useImageQueries from './hooks/useImageQueries';

export const ImagesView = () => {
  const queryResults = useImageQueries();
  const [bootcResults, packageBasedResults, edgeResults] = queryResults;
  const isLoading = queryResults.some((r) => r.isLoading);
  const isError = queryResults.some((r) => r.isError);
  const activeState = isLoading ? 'loading' : isError ? 'error' : 'active';

  const columns: DataViewTh[] = ['Image name', 'Hash commits', 'Systems'];
  const rows: DataViewTrTree[] = useRows({
    bootcSystems: bootcResults.data,
    packageBasedData: packageBasedResults.data,
    edgeData: edgeResults.data,
  });

  return (
    <DataView activeState={activeState}>
      <DataViewTable
        isTreeTable
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
          empty: <NoEntitiesFound />,
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
