/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Modal,
  Popover,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import TabCard from './TabCard';
import { CONVENTIONAL_TAB_TOOLTIP, IMMUTABLE_TAB_TOOLTIP } from './constants';
import { InventoryHostStalenessPopover } from './constants';
// import { groupsApi } from '../../api';

const HostStalenessCard = () => {
  //multiply these values be seconds at the end before sending to the api
  const [filter, setFilter] = useState({
    system_staleness_delta: '2',
    system_stale_warning_delta: '14',
    system_culling_delta: '21',
    edge_staleness_delta: '7',
    edge_stale_warning_delta: '150',
    edge_culling_delta: '120',
  });

  const [newFormValues, setNewFormValues] = useState(filter);
  const [edit, setEdit] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  // const [groupTotal, setGroupTotal] = useState(0);

  const handleTabClick = (_event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const resetToOriginalValues = () => {
    setNewFormValues(filter);
    setEdit(!edit);
  };

  const updateHost = () => {};

  // useEffect(() => {
  //   groupsApi.apiGroupGetGroupList().then((res) => setGroupTotal(res.total));
  // }, []);
  // https://console.redhat.com/api/inventory/v1/groups get the count
  // Need to update the edit button so that it makes the POST req,
  return (
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
          <p className="pf-u-font-weight-bold">System configuration</p>
          <a
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
                <Button key="confirm" variant="primary" onClick={updateHost}>
                  Update
                </Button>,
                <Button key="cancel" variant="link" onClick={handleModalToggle}>
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
  );
};

export default HostStalenessCard;
