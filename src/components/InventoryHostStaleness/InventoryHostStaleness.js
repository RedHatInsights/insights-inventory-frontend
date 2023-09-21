/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import HostStalenessCard from './HostStalenessCard';

//Flow for empty/error state is yet to be mocked.
// const REQUIRED_PERMISSIONS = GENERAL_GROUPS_WRITE_PERMISSION;
const InventoryHostStaleness = () => {
  const [isLoading] = useState(false);
  // const { hasAccess: canModifyGroups } =
  //   usePermissionsWithContext(REQUIRED_PERMISSIONS);

  return (
    <section>
      {isLoading ? (
        <Bullseye>
          <Spinner />
        </Bullseye>
      ) : (
        <section className="pf-l-page__main-section pf-c-page__main-section">
          <HostStalenessCard />
        </section>
      )}
    </section>
  );
};

export default InventoryHostStaleness;
