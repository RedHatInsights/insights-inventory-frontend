import React from 'react';
import { PageSection } from '@patternfly/react-core';
import InventoryPageHeader from '../InventoryComponents/InventoryPageHeader';
import SystemsTable from './components/SystemsTable';
import {
  filtersSerialiser,
  sortSerialiser,
  paginationSerialiser,
} from './serialisers';
import { fetchSystems } from './helpers';

const Inventory = () => (
  <>
    <InventoryPageHeader />
    <PageSection>
      <SystemsTable
        fetchSystems={fetchSystems}
        options={{
          perPage: 50,
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

export default Inventory;
