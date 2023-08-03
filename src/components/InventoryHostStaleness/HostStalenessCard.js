/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import TabCard from './TabCard';

const HostStalenessCard = () => {
  const [filter, setFilter] = useState({
    system_staleness_delta: 1,
    system_stale_warning_delta: 7,
    system_culling_delta: 30,
    edge_staleness_delta: 1,
    edge_stale_warning_delta: 2,
    edge_culling_delta: 30,
  });
  const [newFormValues, setNewFormValues] = useState(filter);
  const [edit, setEdit] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState(0);
  const handleTabClick = (_event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  //TODO need to pass down filters to TabCards to udpate state
  //TODO Create a custom table for groups
  //Create a modal for the edit button
  return (
    <Card>
      <CardHeader>
        <Title headingLevel="h4" size="xl">
          Organization level system staleness and culling
        </Title>
        <Tooltip content={'testing testing 123'}>
          <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
        </Tooltip>
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
                <Tooltip content={'testing testing 123'}>
                  <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
                </Tooltip>
              </TabTitleText>
            }
          >
            <TabCard
              edit={edit}
              filter={filter}
              setFilter={setFilter}
              activeTabKey={activeTabKey}
              newFormValues={newFormValues}
              setNewFormValues={setNewFormValues}
            />
          </Tab>
          <Tab
            eventKey={1}
            title={
              <TabTitleText>
                Immutable (OSTree){' '}
                <Tooltip content={'testing testing 123'}>
                  <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
                </Tooltip>
              </TabTitleText>
            }
          >
            <TabCard
              edit={edit}
              filter={filter}
              setFilter={setFilter}
              activeTabKey={activeTabKey}
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
