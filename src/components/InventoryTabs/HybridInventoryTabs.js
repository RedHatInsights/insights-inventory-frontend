import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import {
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_EDGE_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  hybridInventoryTabKeys,
} from '../../Utilities/constants';
import { manageEdgeInventoryUrlName } from '../../Utilities/edge';

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

  const [hasEdgeImages, setHasEdgeImages] = useState(false);
  const [isOstreeTabFocusPriority, setIsOstreeTabFocusPriority] =
    useState(false);
  const EdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');
  if (EdgeParityEnabled) {
    try {
      axios
        .get(
          `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_EDGE_PARAMS}`
        )
        .then((result) => {
          const accountHasEdgeImages = result?.data?.total > 0;
          setHasEdgeImages(accountHasEdgeImages);
          axios
            .get(
              `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}`
            )
            .then((conventionalImages) => {
              const accountHasConventionalImages =
                conventionalImages?.data?.total > 0;
              if (accountHasEdgeImages && !accountHasConventionalImages) {
                handleTabClick(undefined, manageEdgeInventoryUrlName);
                setIsOstreeTabFocusPriority(true);
              }
            });
        });
    } catch (e) {
      console.log(e);
    }
  }

  return EdgeParityEnabled && hasEdgeImages ? (
    <Tabs
      className="pf-m-light pf-c-table"
      activeKey={activeTab}
      onSelect={handleTabClick}
      defaultActiveKey={
        isOstreeTabFocusPriority ? manageEdgeInventoryUrlName : 'conventional'
      }
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
