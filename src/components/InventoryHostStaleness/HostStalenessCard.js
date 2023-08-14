/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Flex,
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
  const handleTabClick = (_event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  //newFormValue manipulation:
  //styling and messages
  // Need to update the edit button so that it makes the POST req,
  return (
    <Card>
      <CardHeader>
        <Title headingLevel="h4" size="xl">
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
          <p>System Configuration</p>
          <a
            onClick={() => {
              setEdit(!edit);
            }}
          >
            Edit
          </a>
        </Flex>
        <Tabs
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
                  headerContent={<div>Conventional systems(RPM-DNF)</div>}
                  bodyContent={<div>{CONVENTIONAL_TAB_TOOLTIP}</div>}
                  footerContent="Popover footer"
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
            />
          </Tab>
          <Tab
            eventKey={1}
            title={
              <TabTitleText>
                Immutable (OSTree){' '}
                <Popover
                  aria-label="Basic popover"
                  headerContent={<div>Immutable(OSTree)</div>}
                  bodyContent={<div>{IMMUTABLE_TAB_TOOLTIP}</div>}
                  footerContent="Popover footer"
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
            />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default HostStalenessCard;
