import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import {
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_EDGE_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  hybridInventoryTabKeys,
} from '../../Utilities/constants';
import { useNavigate } from 'react-router-dom';

const HybridInventoryTabs = ({
  ConventionalSystemsTab,
  ImmutableDevicesTab,
  tabPathname,
  isImmutableTabOpen,
}) => {
  const { search } = useLocation();
  //used to hold URL params across tab changes
  const prevSearchRef = useRef('');
  const navigate = useNavigate();
  const [hasEdgeImages, setHasEdgeImages] = useState(false);
  const EdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');
  useEffect(() => {
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
                  handleTabClick(
                    undefined,
                    hybridInventoryTabKeys.immutable.key
                  );
                }
              });
          });
      } catch (e) {
        console.log(e);
      }
    }
  }, [EdgeParityEnabled]);

  const activeTab = isImmutableTabOpen
    ? hybridInventoryTabKeys.immutable.key
    : hybridInventoryTabKeys.conventional.key;

  const handleTabClick = (_event, tabIndex) => {
    const pathWithParams =
      tabPathname +
      hybridInventoryTabKeys[tabIndex].url +
      (prevSearchRef.current || '');

    if (tabIndex !== activeTab) {
      prevSearchRef.current = search.toString();
      navigate(pathWithParams, {
        replace: true,
      });
    }
  };

  return EdgeParityEnabled && hasEdgeImages ? (
    <Tabs
      className="pf-m-light pf-c-table"
      activeKey={activeTab}
      onSelect={handleTabClick}
      aria-label="Hybrid inventory tabs"
      mountOnEnter
      unmountOnExit
    >
      <Tab
        aria-label="Conventional tab"
        eventKey={hybridInventoryTabKeys.conventional.key}
        title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
      >
        {ConventionalSystemsTab}
      </Tab>
      <Tab
        aria-label="Immutable tab"
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
  tabPathname: PropTypes.string,
};

HybridInventoryTabs.defaultProps = {
  tabPathname: '/insights/inventory',
};
export default HybridInventoryTabs;
