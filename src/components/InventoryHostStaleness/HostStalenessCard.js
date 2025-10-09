/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
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
  fetchDefaultStalenessValues,
  fetchStalenessData,
  postStalenessData,
} from '../../api';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import PropTypes from 'prop-types';
import { updateStaleness } from '../../api/hostInventoryApi';

const HostStalenessCard = ({ canModifyHostStaleness }) => {
  const [filter, setFilter] = useState({});
  const [newFormValues, setNewFormValues] = useState(filter);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hostStalenessDefaults, setHostStalenessDefaults] = useState({});
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
    let apiData = {};
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
            id: 'settings-saved',
            variant: 'success',
            title: 'Organization level settings saved',
            description: `Organization level settings saved`,
            dismissable: true,
          });
          fetchApiStalenessData();
          setIsEditing(!isEditing);
          setIsModalOpen(false);
        })
        .catch(() => {
          addNotification({
            id: 'settings-saved-failed',
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
            id: 'settings-saved',
            variant: 'success',
            title: 'Organization level settings saved',
            dismissable: true,
          });
          fetchApiStalenessData();
          setIsEditing(!isEditing);
          setIsModalOpen(false);
        })
        .catch(() => {
          addNotification({
            id: 'settings-saved-failed',
            variant: 'danger',
            title: 'Error saving organization level settings',
            dismissable: true,
          });
        });
    }
  };

  const fetchApiStalenessData = async () => {
    let results = await fetchStalenessData();
    let newFilter = {};
    hostStalenessApiKeys.forEach(
      (filterKey) =>
        (newFilter[filterKey] = secondsToDaysConversion(results[filterKey])),
    );
    newFilter['id'] = results.id;
    setFilter(newFilter);
    setNewFormValues(newFilter);
  };
  //keeps track of what default the backend wants
  const fetchDefaultValues = async () => {
    let results = await fetchDefaultStalenessValues().catch((err) => err);
    let conventionalFilter = {};

    Object.keys(results).forEach((key) => {
      if (key.includes('conventional')) {
        conventionalFilter[key] = secondsToDaysConversion(results[key]);
      }
    });

    setHostStalenessDefaults({
      ...hostStalenessDefaults,
      ...conventionalFilter,
    });
  };

  const batchedApi = async () => {
    await fetchApiStalenessData();
    await fetchDefaultValues();
    setIsLoading(false);
  };

  useEffect(() => {
    batchedApi();
  }, []);

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
              Keep or customize your organization's default settings using the
              options below.
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
                    <Button
                      variant="link"
                      style={{ 'padding-left': '0px' }}
                      isDisabled={!canModifyHostStaleness}
                    >
                      Edit
                    </Button>
                  </div>
                </Tooltip>
              )}
            </Flex>
            {
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
              />
            }
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

HostStalenessCard.propTypes = {
  canModifyHostStaleness: PropTypes.bool.isRequired,
};

export default HostStalenessCard;
