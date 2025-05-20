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

// TODO put behind feature flag
const Systems = () => (
  <>
    <InventoryPageHeader />
    <PageSection>
      <SystemsTable
        // TODO This and the serialisers should maybe be a default of the SystemsTable for apps that don't pass a fetch function
        items={fetchSystems}
        options={{
          debug: true,
          onSelect: true,
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

export default Systems;
