/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Modal,
  Popover,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import TabCard from './TabCard';
import {
  CONVENTIONAL_TAB_TOOLTIP,
  IMMUTABLE_TAB_TOOLTIP,
  daysToSecondsConversion,
  hostStalenessApiKeys,
  secondsToDaysConversion,
} from './constants';
import { InventoryHostStalenessPopover } from './constants';
import { INVENTORY_API_BASE } from '../../api';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useDispatch } from 'react-redux';

const HostStalenessCard = () => {
  //need to figure out which key matches to which dropdown
  //multiply these values be seconds at the end before sending to the api
  const [filter, setFilter] = useState({});
  const [defaultApiValues, setDefaultApiValues] = useState({});
  const axios = useAxiosWithPlatformInterceptors();
  const [newFormValues, setNewFormValues] = useState(filter);
  const [edit, setEdit] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const handleTabClick = (_event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  //Cancel button when a user opts out of saving changes
  const resetToOriginalValues = () => {
    setNewFormValues(filter);
    setEdit(!edit);
  };

  //On save Button
  const saveHostData = async () => {
    let apiData = {};
    hostStalenessApiKeys.forEach(
      (filterKey) =>
        filterKey !== 'id' &&
        (apiData[filterKey] = daysToSecondsConversion(newFormValues[filterKey]))
    );
    //system_default means the account has no record, therefor, post for new instance of record.
    if (filter.id === 'system_default') {
      axios
        .post(`${INVENTORY_API_BASE}/account/staleness`, apiData)
        .then(() => {
          dispatch(
            addNotificationAction({
              id: 'settings-saved',
              variant: 'success',
              title: 'Organization level settings saved',
              description: `Organization level settings saved`,
              dismissable: true,
            })
          );
        })
        .catch(() => {
          dispatch(
            addNotificationAction({
              id: 'settings-saved-failed',
              variant: 'danger',
              title: 'Error saving organization level settings',
              description: `Error saving organization level settings`,
              dismissable: true,
            })
          );
        });
    } else {
      axios
        .patch(`${INVENTORY_API_BASE}/account/staleness`, apiData)
        .then(() => {
          dispatch(
            addNotificationAction({
              id: 'settings-saved',
              variant: 'success',
              title: 'Organization level settings saved',
              dismissable: true,
            })
          );
        })
        .catch(() => {
          dispatch(
            addNotificationAction({
              id: 'settings-saved-failed',
              variant: 'danger',
              title: 'Error saving organization level settings',
              dismissable: true,
            })
          );
        });
    }
    setEdit(!edit);
  };

  const fetchStalenessData = async () => {
    let results = await axios
      .get(`${INVENTORY_API_BASE}/account/staleness`)
      .then((res) => res);
    let newFilter = {};
    hostStalenessApiKeys.forEach(
      (filterKey) =>
        (newFilter[filterKey] = secondsToDaysConversion(results[filterKey]))
    );
    newFilter['id'] = results.id;
    setFilter(newFilter);
    setNewFormValues(newFilter);
  };
  //keeps track of what default the backend wants
  const fetchDefaultValues = async () => {
    let results = await axios
      .get(`${INVENTORY_API_BASE}/account/staleness/defaults`)
      .then((res) => res);
    let newFilter = {};
    hostStalenessApiKeys.forEach(
      (filterKey) =>
        (newFilter[filterKey] = secondsToDaysConversion(results[filterKey]))
    );
    setDefaultApiValues(newFilter);
  };

  const batchedApi = async () => {
    fetchStalenessData();
    fetchDefaultValues();
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
              Organization level system staleness and culling
            </Title>
            <InventoryHostStalenessPopover />
          </CardHeader>
          <CardBody>
            <p>
              Keep or customize your organization's default settings using the
              options below.
            </p>
            <Flex className="pf-u-mt-md">
              <Title headingLevel="h6">System configuration </Title>
              <a
                role="button"
                onClick={() => {
                  setEdit(!edit);
                }}
              >
                Edit
              </a>
            </Flex>
            <Tabs
              id={'HostTabs'}
              className="pf-m-light pf-c-table pf-u-mb-lg pf-u-mt-lg"
              activeKey={activeTabKey}
              onSelect={handleTabClick}
            >
              <Tab
                eventKey={0}
                title={
                  <TabTitleText>
                    Conventional (RPM-DNF){' '}
                    <Popover
                      aria-label="Basic popover"
                      headerContent={<div>Conventional systems (RPM-DNF)</div>}
                      bodyContent={<div>{CONVENTIONAL_TAB_TOOLTIP}</div>}
                    >
                      <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
                    </Popover>
                  </TabTitleText>
                }
              >
                <TabCard
                  edit={edit}
                  setEdit={setEdit}
                  filter={filter}
                  setFilter={setFilter}
                  activeTabKey={0}
                  newFormValues={newFormValues}
                  setNewFormValues={setNewFormValues}
                  isFormValid={isFormValid}
                  setIsFormValid={setIsFormValid}
                  defaultValues={defaultApiValues}
                />
              </Tab>
              <Tab
                eventKey={1}
                title={
                  <TabTitleText>
                    Immutable (OSTree){' '}
                    <Popover
                      aria-label="Basic popover"
                      headerContent={<div>Immutable (OSTree)</div>}
                      bodyContent={<div>{IMMUTABLE_TAB_TOOLTIP}</div>}
                    >
                      <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
                    </Popover>
                  </TabTitleText>
                }
              >
                <TabCard
                  edit={edit}
                  setEdit={setEdit}
                  filter={filter}
                  setFilter={setFilter}
                  activeTabKey={1}
                  newFormValues={newFormValues}
                  setNewFormValues={setNewFormValues}
                  isFormValid={isFormValid}
                  setIsFormValid={setIsFormValid}
                  defaultValues={defaultApiValues}
                />
              </Tab>
            </Tabs>
            {edit && (
              <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
                <Button
                  className="pf-u-mt-md"
                  size={'sm'}
                  onClick={() => handleModalToggle()}
                  isDisabled={!isFormValid}
                >
                  Save
                </Button>
                <Button
                  className="pf-u-mt-md"
                  size={'sm'}
                  variant="link"
                  //CancelButton when a user opts out of saving changes
                  onClick={() => resetToOriginalValues()}
                >
                  Cancel
                </Button>
                <Modal
                  variant="small"
                  titleIconVariant="warning"
                  title="Update organization level setting"
                  isOpen={isModalOpen}
                  onClose={handleModalToggle}
                  actions={[
                    <Button
                      key="confirm"
                      variant="primary"
                      onClick={saveHostData}
                    >
                      Update
                    </Button>,
                    <Button
                      key="cancel"
                      variant="link"
                      onClick={handleModalToggle}
                    >
                      Cancel
                    </Button>,
                  ]}
                  ouiaId="BasicModal"
                >
                  {`Changing the organization level setting for system staleness and
              culling may impact your systems. Some systems will be culled as a
              result.`}
                </Modal>
              </Flex>
            )}{' '}
          </CardBody>
        </Card>
      ) : (
        <Spinner />
      )}
    </React.Fragment>
  );
};

export default HostStalenessCard;
