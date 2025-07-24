import React from 'react';
import { PageSection } from '@patternfly/react-core';
import InventoryPageHeader from '../InventoryComponents/InventoryPageHeader';
import SystemsTable from './components/SystemsTable';
import {
  filtersSerialiser,
  sortSerialiser,
  paginationSerialiser,
} from './serialisers';

const Systems = () => (
  <>
    <InventoryPageHeader />
    <PageSection>
      <SystemsTable
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
