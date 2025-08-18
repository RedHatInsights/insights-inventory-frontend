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
