import React from 'react';
import { PageSection } from '@patternfly/react-core';
import InventoryPageHeader from '../InventoryComponents/InventoryPageHeader';
import SystemsTable from './components/SystemsTable';
import {
  filtersSerialiser,
  sortSerialiser,
  paginationSerialiser,
} from './serialisers';
import * as defaultColumns from './components/SystemsTable/columns';
import * as defaultFilters from './components/SystemsTable/filters';

const Systems = () => (
  <>
    <InventoryPageHeader />
    <PageSection>
      <SystemsTable
        columns={[
          defaultColumns.displayName,
          defaultColumns.workspace,
          defaultColumns.tags,
          defaultColumns.operatingSystem,
          defaultColumns.lastSeen,
        ]}
        filters={{
          filterConfig: [
            defaultFilters.displayName,
            defaultFilters.statusFilter,
            defaultFilters.dataCollector,
            defaultFilters.rhcStatus,
            defaultFilters.tags,
            defaultFilters.systemType,
            defaultFilters.operatingSystem,
            defaultFilters.lastSeen,
            defaultFilters.workspaceFilter,
          ],
          customFilterTypes: defaultFilters.CUSTOM_FILTER_TYPES,
        }}
        options={{
          // FIXME: remove debug
          debug: true,
          serialisers: {
            pagination: paginationSerialiser,
            sort: sortSerialiser,
            filters: filtersSerialiser,
          },
        }}
      />
    </PageSection>
  </>
);

export default Systems;
