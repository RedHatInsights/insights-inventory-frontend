import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { resolveRelPath } from '../../Utilities/path';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import { manageEdgeInventoryUrlName } from '../../Utilities/edge';

const HybridInventoryTabs = ({
  ConventionalSystemsTab,
  ImmutableDevicesTab,
}) => {
  const navigate = useInsightsNavigate();

  const { pathname } = useLocation();
  const tabsPath = [
    resolveRelPath(''),
    resolveRelPath(manageEdgeInventoryUrlName),
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
      navigate(`${tabPath}`);
    }
    setActiveTabKey(tabIndex);
  };

  const EdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');

  return EdgeParityEnabled ? (
    <Tabs
      className="pf-m-light pf-c-table"
      activeKey={activeTabKey}
      onSelect={handleTabClick}
    >
      <>
        <Tab
          eventKey={0}
          title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
        >
          {ConventionalSystemsTab}
        </Tab>
        <Tab
          eventKey={1}
          title={<TabTitleText>Immutable (OSTree)</TabTitleText>}
        >
          {ImmutableDevicesTab}
        </Tab>
      </>
    </Tabs>
  ) : (
    ConventionalSystemsTab
  );
};

HybridInventoryTabs.propTypes = {
  ConventionalSystemsTab: PropTypes.element.isRequired,
  ImmutableDevicesTab: PropTypes.element.isRequired,
};
export default HybridInventoryTabs;
