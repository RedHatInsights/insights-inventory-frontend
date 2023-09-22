import React from 'react';
import PropTypes from 'prop-types';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import { hybridInventoryTabKeys } from '../../Utilities/constants';

const HybridInventoryTabs = ({
  ConventionalSystemsTab,
  ImmutableDevicesTab,
  isImmutableTabOpen,
}) => {
  const navigate = useInsightsNavigate();
  const activeTab = isImmutableTabOpen
    ? hybridInventoryTabKeys.immutable.key
    : hybridInventoryTabKeys.conventional.key;

  const handleTabClick = (_event, tabIndex) => {
    navigate(hybridInventoryTabKeys[tabIndex].url);
  };

  const EdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');

  return EdgeParityEnabled ? (
    <Tabs
      className="pf-m-light pf-c-table"
      activeKey={activeTab}
      onSelect={handleTabClick}
      aria-label="Hybrid inventory tabs"
    >
      <Tab
        eventKey={hybridInventoryTabKeys.conventional.key}
        title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
      >
        {ConventionalSystemsTab}
      </Tab>
      <Tab
        eventKey={hybridInventoryTabKeys.immutable.key}
        title={<TabTitleText>Immutable (OSTree)</TabTitleText>}
      >
        {ImmutableDevicesTab}
      </Tab>
    </Tabs>
  ) : (
    ConventionalSystemsTab
  );
};

HybridInventoryTabs.propTypes = {
  ConventionalSystemsTab: PropTypes.element.isRequired,
  ImmutableDevicesTab: PropTypes.element.isRequired,
  isImmutableTabOpen: PropTypes.bool,
};
export default HybridInventoryTabs;
