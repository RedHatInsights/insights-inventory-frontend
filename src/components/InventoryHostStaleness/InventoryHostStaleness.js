/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import HostStalenessCard from './HostStalenessCard';

const InventoryHostStaleness = () => {
  const [isLoading] = useState(false);

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
