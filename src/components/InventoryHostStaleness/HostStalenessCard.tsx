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
import HostStalenessSettings from './HostStalenessSettings';
import {
  daysToSecondsConversion,
  HostStalenessApiKey,
  hostStalenessApiKeys,
  omitId,
  secondsToDaysConversion,
} from './constants';
import {
  deleteStalenessData,
  fetchDefaultStalenessValues,
  fetchStalenessData,
  postStalenessData,
} from '../../api';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { updateStaleness } from '../../api/hostInventoryApi';
import { StalenessOutput } from '@redhat-cloud-services/host-inventory-client';
import { HostStalenessPopover } from './HostStalenessPopover';
import isEqual from 'lodash/isEqual';

interface HostStalenessCardProps {
  canModifyHostStaleness: boolean;
}

export type Staleness = {
  id?: string;
} & Partial<Record<HostStalenessApiKey, number>>;

const HostStalenessCard = ({
  canModifyHostStaleness,
}: HostStalenessCardProps) => {
  const [lastSavedStaleness, setLastSavedStaleness] = useState<Staleness>({});
  const [staleness, setStaleness] = useState<Staleness>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStalenessValid, setIsStalenessValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultStaleness, setDefaultStaleness] = useState<Staleness>({});
  const addNotification = useAddNotification();

  const isStalenessModified = !isEqual(
    omitId(lastSavedStaleness),
    omitId(staleness),
  );
  const isStalenessDefault = isEqual(
    omitId(defaultStaleness),
    omitId(staleness),
  );

  const onModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const onCancel = () => {
    setStaleness(lastSavedStaleness);
    setIsEditing((prev) => !prev);
  };

  const onSave = async () => {
    let apiData: Staleness = {};
    hostStalenessApiKeys.forEach(
      (apiKey) =>
        staleness[apiKey] &&
        (apiData[apiKey] = daysToSecondsConversion(staleness[apiKey], apiKey)),
    );

    const isSystemDefaultUsed = lastSavedStaleness.id === 'system_default';
    if (isSystemDefaultUsed) {
      postStalenessData(apiData)
        .then(() => {
          addNotification({
            variant: 'success',
            title: 'Organization level settings saved',
            description: `Organization level settings saved`,
            dismissable: true,
          });
          void fetchApiStalenessData();
          setIsEditing((prev) => !prev);
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
    } else if (isStalenessDefault) {
      deleteStalenessData()
        .then(() => {
          addNotification({
            variant: 'success',
            title: 'Organization level settings saved',
            description: `Organization level settings saved`,
            dismissable: true,
          });
          void fetchApiStalenessData();
          setIsEditing((prev) => !prev);
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
    let results: StalenessOutput = await fetchStalenessData();
    let newStaleness: Staleness = {};
    hostStalenessApiKeys.forEach(
      (apiKey) =>
        (newStaleness[apiKey] = secondsToDaysConversion(results[apiKey])),
    );
    newStaleness['id'] = results.id;
    setLastSavedStaleness(newStaleness);
    setStaleness(newStaleness);
  }, []);

  //keeps track of what default the backend wants
  const fetchDefaultValues = useCallback(async () => {
    let results: StalenessOutput = await fetchDefaultStalenessValues().catch(
      (err) => err,
    );
    let newDefaultStaleness: Staleness = {};

    (Object.keys(results) as (keyof StalenessOutput)[]).forEach((key) => {
      if ((hostStalenessApiKeys as readonly string[]).includes(key)) {
        const apiKey = key as HostStalenessApiKey;
        newDefaultStaleness[apiKey] = secondsToDaysConversion(results[apiKey]);
      }
    });

    setDefaultStaleness((hostStalenessDefaults) => ({
      ...hostStalenessDefaults,
      ...newDefaultStaleness,
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
              <HostStalenessPopover />
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
                  onClick={() => setIsEditing(true)}
                  ouiaId="edit-staleness-setting"
                  style={isEditing ? { visibility: 'hidden' } : {}}
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
            <HostStalenessSettings
              isEditing={isEditing}
              staleness={staleness}
              setStaleness={setStaleness}
              isStalenessValid={isStalenessValid}
              setIsStalenessValid={setIsStalenessValid}
              defaultStaleness={defaultStaleness}
              isStalenessDefault={isStalenessDefault}
            />
            {isEditing && (
              <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
                <Button
                  className="pf-v6-u-mt-md"
                  size={'sm'}
                  onClick={onModalToggle}
                  isDisabled={!isStalenessModified || !isStalenessValid}
                >
                  Save
                </Button>
                <Button
                  className="pf-v6-u-mt-md"
                  size={'sm'}
                  variant="link"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Modal
                  variant="small"
                  isOpen={isModalOpen}
                  onClose={onModalToggle}
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
                    <Button key="confirm" variant="primary" onClick={onSave}>
                      Update
                    </Button>
                    <Button key="cancel" variant="link" onClick={onModalToggle}>
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
