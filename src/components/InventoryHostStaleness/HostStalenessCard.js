/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { useLocation } from 'react-router-dom/cjs/react-router-dom';
import { resolveRelPath } from '../../Utilities/path';

const HostStalenessCard = () => {
  const { pathname } = useLocation();
  const tabsPath = [
    resolveRelPath(''),
    // resolveRelPath(manageEdgeInventoryUrlName),
  ];
  const initialActiveTabKey =
    tabsPath.indexOf(pathname) >= 0 ? tabsPath.indexOf(pathname) : 0;
  const [activeTabKey, setActiveTabKey] = useState(initialActiveTabKey);

  useEffect(() => {
    setActiveTabKey(initialActiveTabKey);
  }, [pathname]);
  const handleTabClick = (_event, tabIndex) => {
    const tabPath = tabsPath[tabIndex];
    if (tabPath !== undefined) {
      history.push(`${tabPath}`);
    }
    setActiveTabKey(tabIndex);
  };

  return (
    <Card>
      <CardHeader>
        <Title headingLevel="h4" size="xl">
          Organization level system staleness and culling
        </Title>
      </CardHeader>
      <CardBody>
        <p>
          Keep or customize your organization's default settings using the
          options below.
        </p>
        <Tabs
          className="pf-m-light pf-c-table"
          activeKey={activeTabKey}
          onSelect={handleTabClick}
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
          ></Tab>
          <Tab
            eventKey={1}
            title={<TabTitleText>Immutable (OSTree)</TabTitleText>}
          >
            <h1>BLA</h1>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default HostStalenessCard;
