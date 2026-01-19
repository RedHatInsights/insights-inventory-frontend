import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import StalenessSettings from './StalenessSettings';
import {
  conventionalApiKeys,
  daysToSecondsConversion,
  hostStalenessApiKeys,
  secondsToDaysConversion,
} from './constants';
import { InventoryHostStalenessPopover } from './constants';
import {
  deleteStalenessData,
  fetchDefaultStalenessValues,
  fetchStalenessData,
  postStalenessData,
} from '../../api';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { updateStaleness } from '../../api/hostInventoryApi';

interface HostStalenessCardProps {
  canModifyHostStaleness: boolean;
}

const HostStalenessCard = ({
  canModifyHostStaleness,
}: HostStalenessCardProps) => {
  const [filter, setFilter] = useState<Record<string, string | number>>({});
  const [newFormValues, setNewFormValues] = useState(filter);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hostStalenessDefaults, setHostStalenessDefaults] = useState({});
  const [isResetToDefault, setIsResetToDefault] = useState(false);
  const addNotification = useAddNotification();

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  //Cancel button when a user opts out of saving changes
  const resetToOriginalValues = () => {
    setNewFormValues(filter);
    setIsEditing(!isEditing);
  };
  //On save Button
  const saveHostData = async () => {
    let apiData: Record<string, string | number> = {};
    let apiKeys = conventionalApiKeys;
    apiKeys.forEach(
      (filterKey) =>
        filterKey !== 'id' &&
        newFormValues[filterKey] &&
        (apiData[filterKey] = daysToSecondsConversion(
          newFormValues[filterKey],
          filterKey,
        )),
    );
    // system_default means the account has no record, therefor, post for new instance of record.
    if (filter.id === 'system_default') {
      postStalenessData(apiData)
        .then(() => {
          addNotification({
            variant: 'success',
            title: 'Organization level settings saved',
            description: `Organization level settings saved`,
            dismissable: true,
          });
          void fetchApiStalenessData();
          setIsEditing(!isEditing);
          setIsModalOpen(false);
        })
        .catch(() => {
          addNotification({
            variant: 'danger',
            title: 'Error saving organization level settings',
            description: `Error saving organization level settings`,
            dismissable: true,
          });
        });
    } else if (isResetToDefault) {
      deleteStalenessData()
        .then(() => {
          addNotification({
            variant: 'success',
            title: 'Organization level settings saved',
            description: `Organization level settings saved`,
            dismissable: true,
          });
          void fetchApiStalenessData();
          setIsResetToDefault(false);
          setIsEditing(!isEditing);
          setIsModalOpen(false);
        })
        .catch(() => {
          addNotification({
            variant: 'danger',
            title: 'Error saving organization level settings',
            description: `Error saving organization level settings`,
            dismissable: true,
          });
        });
    } else {
      updateStaleness({ stalenessIn: apiData })
        .then(() => {
          addNotification({
            variant: 'success',
            title: 'Organization level settings saved',
            dismissable: true,
          });
          void fetchApiStalenessData();
          setIsEditing(!isEditing);
          setIsModalOpen(false);
        })
        .catch(() => {
          addNotification({
            variant: 'danger',
            title: 'Error saving organization level settings',
            dismissable: true,
          });
        });
    }
  };

  const fetchApiStalenessData = useCallback(async () => {
    let results = await fetchStalenessData();
    let newFilter: Record<string, string | number> = {};
    hostStalenessApiKeys.forEach(
      (filterKey) =>
        (newFilter[filterKey] = secondsToDaysConversion(results[filterKey])),
    );
    newFilter['id'] = results.id;
    setFilter(newFilter);
    setNewFormValues(newFilter);
  }, []);

  //keeps track of what default the backend wants
  const fetchDefaultValues = useCallback(async () => {
    let results = await fetchDefaultStalenessValues().catch((err) => err);
    let conventionalFilter: Record<string, string | number> = {};

    Object.keys(results).forEach((key) => {
      if (key.includes('conventional')) {
        conventionalFilter[key] = secondsToDaysConversion(results[key]);
      }
    });

    setHostStalenessDefaults((hostStalenessDefaults) => ({
      ...hostStalenessDefaults,
      ...conventionalFilter,
    }));
  }, []);

  const batchedApi = useCallback(async () => {
    await fetchApiStalenessData();
    await fetchDefaultValues();
    setIsLoading(false);
  }, [fetchApiStalenessData, fetchDefaultValues]);

  useEffect(() => {
    void batchedApi();
  }, [batchedApi]);

  return (
    <React.Fragment>
      {!isLoading ? (
        <Card id={'HostStalenessCard'}>
          <CardHeader>
            <Title headingLevel="h4" size="xl" id="HostTitle">
              Organization level system staleness and deletion
              <InventoryHostStalenessPopover />
            </Title>
          </CardHeader>
          <CardBody>
            <p>
              {
                "Keep or customize your organization's default settings using the options below."
              }
            </p>
            <Flex className="pf-v6-u-mt-md">
              <Title headingLevel="h6">System configuration</Title>
              {canModifyHostStaleness ? (
                <Button
                  variant="link"
                  role="button"
                  onClick={() => {
                    setIsEditing(!isEditing);
                  }}
                  ouiaId="edit-staleness-setting"
                  isDisabled={isEditing}
                >
                  Edit
                </Button>
              ) : (
                <Tooltip content="You do not have the Staleness and deletion admin role and/or Inventory Hosts Administrator role required to perform this action. Contact your org admin for access.">
                  <div>
                    <Button variant="link" isDisabled={true}>
                      Edit
                    </Button>
                  </div>
                </Tooltip>
              )}
            </Flex>
            <StalenessSettings
              isEditing={isEditing}
              filter={filter}
              setFilter={setFilter}
              activeTabKey={0}
              newFormValues={newFormValues}
              setNewFormValues={setNewFormValues}
              isFormValid={isFormValid}
              setIsFormValid={setIsFormValid}
              hostStalenessDefaults={hostStalenessDefaults}
              setIsResetToDefault={setIsResetToDefault}
            />
            {isEditing && (
              <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
                <Button
                  className="pf-v6-u-mt-md"
                  size={'sm'}
                  onClick={() => handleModalToggle()}
                  isDisabled={!isFormValid}
                >
                  Save
                </Button>
                <Button
                  className="pf-v6-u-mt-md"
                  size={'sm'}
                  variant="link"
                  //CancelButton when a user opts out of saving changes
                  onClick={() => resetToOriginalValues()}
                >
                  Cancel
                </Button>
                <Modal
                  variant="small"
                  isOpen={isModalOpen}
                  onClose={handleModalToggle}
                  ouiaId="BasicModal"
                >
                  <ModalHeader
                    title="Update organization level setting"
                    titleIconVariant="warning"
                  />
                  <ModalBody>
                    Changing the organization level setting for system staleness
                    and deletion may impact your systems. Some systems may be
                    deleted as a result.
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      key="confirm"
                      variant="primary"
                      onClick={saveHostData}
                    >
                      Update
                    </Button>
                    <Button
                      key="cancel"
                      variant="link"
                      onClick={handleModalToggle}
                    >
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
              </Flex>
            )}
          </CardBody>
        </Card>
      ) : (
        <Spinner />
      )}
    </React.Fragment>
  );
};

export default HostStalenessCard;
