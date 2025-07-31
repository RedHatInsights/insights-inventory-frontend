import React from 'react';
import { PageSection } from '@patternfly/react-core';
import InventoryPageHeader from '../InventoryComponents/InventoryPageHeader';
import SystemsTable from './components/SystemsTable';
import {
  filtersSerialiser,
  sortSerialiser,
  paginationSerialiser,
} from './serialisers';
import { SHARED_COLUMNS } from './components/SystemsTable/columns';

const Systems = () => (
  <>
    <InventoryPageHeader />
    <PageSection>
      <SystemsTable
        columns={[
          SHARED_COLUMNS.displayName,
          SHARED_COLUMNS.workspace,
          SHARED_COLUMNS.tags,
          SHARED_COLUMNS.operatingSystem,
          SHARED_COLUMNS.lastSeen,
        ]}
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
