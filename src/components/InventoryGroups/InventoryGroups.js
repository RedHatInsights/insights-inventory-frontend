import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import PageHeaderTitle from '@redhat-cloud-services/frontend-components/PageHeaderTitle';
import React, { useEffect, useRef, useState } from 'react';

import { Bullseye, Spinner } from '@patternfly/react-core';
import GroupsTable from '../GroupsTable/GroupsTable';
import { getGroups } from '../InventoryGroups/utils/api';
import NoGroupsEmptyState from './NoGroupsEmptyState';

const InventoryGroups = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasGroups, setHasGroups] = useState(false);
  const [hasError, setHasError] = useState(false);

  const ignore = useRef(false); // https://react.dev/learn/synchronizing-with-effects#fetching-data

  const handleLoading = async () => {
    // make initial request to check if there is at least one group available
    try {
      const { total } = await getGroups();

      if (total > 0) {
        !ignore.current && setHasGroups(true);
      }
    } catch (error) {
      !ignore.current && setHasError(true);
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
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title="Groups" />
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        {hasError ? (
          <ErrorState />
        ) : isLoading ? (
          <Bullseye>
            <Spinner />
          </Bullseye>
        ) : hasGroups ? (
          <GroupsTable />
        ) : (
          <NoGroupsEmptyState reloadData={handleLoading} />
        )}
      </section>
    </React.Fragment>
  );
};

export default InventoryGroups;
