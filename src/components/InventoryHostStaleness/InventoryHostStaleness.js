/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState } from 'react';

import { Bullseye, Spinner } from '@patternfly/react-core';
import GroupsTable from '../GroupsTable/GroupsTable';
import { getGroups } from '../InventoryGroups/utils/api';
import NoGroupsEmptyState from '../InventoryGroups/NoGroupsEmptyState';
import { EmptyStateNoAccessToGroups } from '../InventoryGroupDetail/EmptyStateNoAccess';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import HostStalenessCard from './HostStalenessCard';

// Here is where I'll put the top section, a seperate file for the table.
const InventoryHostStaleness = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasGroups, setHasGroups] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const ignore = useRef(false); // https://react.dev/learn/synchronizing-with-effects#fetching-data

  const handleLoading = async () => {
    // make initial request to check if there is at least one group available
    try {
      const { total } = await getGroups();

      if (total > 0) {
        !ignore.current && setHasGroups(true);
      }
    } catch (error) {
      if (!ignore.current) {
        setHasError(true);
        setError(error);
      }
    }

    !ignore.current && setIsLoading(false);
  };

  useEffect(() => {
    handleLoading();

    return () => {
      ignore.current = true;
    };
  }, []);

  return (
    <section>
      {hasError ? (
        error?.status === 403 || error?.response?.status === 403 ? (
          <EmptyStateNoAccessToGroups />
        ) : (
          <ErrorState />
        )
      ) : isLoading ? (
        <Bullseye>
          <Spinner />
        </Bullseye>
      ) : hasGroups ? (
        <React.Fragment>
          <section className="pf-l-page__main-section pf-c-page__main-section">
            <HostStalenessCard />
          </section>
          <section className="pf-l-page__main-section pf-c-page__main-section">
            <GroupsTable />
          </section>
        </React.Fragment>
      ) : (
        <NoGroupsEmptyState reloadData={handleLoading} />
      )}
    </section>
  );
};

export default InventoryHostStaleness;
