import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Bullseye, Spinner } from '@patternfly/react-core';
import GroupsTable from '../GroupsTable/GroupsTable';
import { getGroups } from '../InventoryGroups/utils/api';
import NoGroupsEmptyState from './NoGroupsEmptyState';
import { EmptyStateNoAccessToGroups } from '../InventoryGroupDetail/EmptyStateNoAccess';
import GetHelpExpandable from './GetHelpExpandable';
import CreateGroupModal from './Modals/CreateGroupModal';
import { PageSection } from '@patternfly/react-core';

const InventoryGroups = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasGroups, setHasGroups] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const ignore = useRef(false); // https://react.dev/learn/synchronizing-with-effects#fetching-data

  const handleLoading = async () => {
    setIsLoading(true);

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

  const onCreateGroupClick = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  useEffect(() => {
    handleLoading();

    return () => {
      ignore.current = true;
    };
  }, []);

  return (
    <PageSection
      data-ouia-component-id="groups-table-wrapper"
      data-testid="groups-table-wrapper"
      style={{ height: '100%' }}
    >
      {createModalOpen && (
        <CreateGroupModal
          isModalOpen={createModalOpen}
          setIsModalOpen={setCreateModalOpen}
          reloadData={handleLoading}
        />
      )}
      <GetHelpExpandable />
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
        <GroupsTable onCreateGroupClick={onCreateGroupClick} />
      ) : (
        <NoGroupsEmptyState onCreateGroupClick={onCreateGroupClick} />
      )}
    </PageSection>
  );
};

export default InventoryGroups;
