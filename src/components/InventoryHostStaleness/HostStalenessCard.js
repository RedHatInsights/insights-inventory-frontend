/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import TabCard from './TabCard';

const HostStalenessCard = () => {
  // const [filter, setFiletr] = useState({
  //   systemStaleness: 1,
  //   systemStaleWarning: 7,
  //   systemCulling: 30,
  //   edgeStaleness: 1,
  //   edgeStaleWarning: 2,
  //   edgeCullding: 30,
  // });
  const [activeTabKey, setActiveTabKey] = useState(0);
  const handleTabClick = (_event, tabIndex) => {
    setActiveTabKey(tabIndex);
  };

  //TODO need to pass down filters to TabCards to udpate state
  //TODO add ability to go back and forth on tabs via url
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
            <TabCard />
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
            <TabCard />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default HostStalenessCard;
