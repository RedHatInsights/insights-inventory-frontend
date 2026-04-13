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
import { useWorkspacesPageKesselAccess } from '../../Utilities/hooks/useWorkspacesPageKesselAccess';
import { isRbacFetchAccessDenied } from '../../Utilities/kesselRbacFetchErrors';

const computeViewState = ({
  hasError,
  error,
  pageLoading,
  isKesselGated,
  kesselCheckError,
  defaultWorkspaceFetchError,
  canViewDefaultWorkspace,
  hasGroups,
}) => {
  if (hasError) {
    if (error?.status === 403 || error?.response?.status === 403) {
      return 'globalNoAccess';
    }
    return 'globalError';
  }

  if (pageLoading) {
    return 'loading';
  }

  if (isKesselGated) {
    if (kesselCheckError) {
      return 'kesselError';
    }

    if (defaultWorkspaceFetchError) {
      return isRbacFetchAccessDenied(defaultWorkspaceFetchError)
        ? 'kesselNoAccess'
        : 'kesselWorkspaceError';
    }

    if (canViewDefaultWorkspace === false) {
      return 'kesselNoAccess';
    }
  }

  if (hasGroups) {
    return 'groups';
  }

  return 'noGroups';
};

const InventoryGroups = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasGroups, setHasGroups] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    isKesselGated,
    isWorkspaceAccessLoading,
    canViewDefaultWorkspace,
    defaultWorkspaceFetchError,
    kesselCheckError,
  } = useWorkspacesPageKesselAccess();

  const ignore = useRef(false); // https://react.dev/learn/synchronizing-with-effects#fetching-data

  const handleLoading = async () => {
    setIsLoading(true);

    // make initial request to check if there is at least one group available
    try {
      const { total } = await getGroups();

      if (total > 0) {
        if (!ignore.current) setHasGroups(true);
      }
    } catch (error) {
      if (!ignore.current) {
        setHasError(true);
        setError(error);
      }
    }

    if (!ignore.current) setIsLoading(false);
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

  const pageLoading = isLoading || (isKesselGated && isWorkspaceAccessLoading);

  const viewState = computeViewState({
    hasError,
    error,
    pageLoading,
    isKesselGated,
    kesselCheckError,
    defaultWorkspaceFetchError,
    canViewDefaultWorkspace,
    hasGroups,
  });

  return (
    <PageSection
      hasBodyWrapper={false}
      data-ouia-component-id="groups-table-wrapper"
      data-testid="groups-table-wrapper"
    >
      {createModalOpen && (
        <CreateGroupModal
          isModalOpen={createModalOpen}
          setIsModalOpen={setCreateModalOpen}
          reloadData={handleLoading}
        />
      )}
      <GetHelpExpandable />
      {viewState === 'globalNoAccess' || viewState === 'kesselNoAccess' ? (
        <EmptyStateNoAccessToGroups />
      ) : viewState === 'globalError' ||
        viewState === 'kesselError' ||
        viewState === 'kesselWorkspaceError' ? (
        <ErrorState />
      ) : viewState === 'loading' ? (
        <Bullseye>
          <Spinner />
        </Bullseye>
      ) : viewState === 'groups' ? (
        <GroupsTable onCreateGroupClick={onCreateGroupClick} />
      ) : (
        <NoGroupsEmptyState onCreateGroupClick={onCreateGroupClick} />
      )}
    </PageSection>
  );
};

export default InventoryGroups;
