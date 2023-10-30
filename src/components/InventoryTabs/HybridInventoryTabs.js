import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import {
  INVENTORY_GROUP_NAME,
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_EDGE_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  hybridInventoryTabKeys,
} from '../../Utilities/constants';
import { useNavigate } from 'react-router-dom';
import GroupTabDetails from '../InventoryGroupDetail/GroupTabDetails';
import { EmptyStateNoAccessToSystems } from '../InventoryGroupDetail/EmptyStateNoAccess';
const HybridInventoryTabs = ({
  ConventionalSystemsTab,
  ImmutableDevicesTab,
  tabPathname,
  isImmutableTabOpen,
  isEdgeParityEnabled,
  groupName,
  groupId,
}) => {
  const { search } = useLocation();
  //used to hold URL params across tab changes
  const prevSearchRef = useRef('');
  const navigate = useNavigate();
  const [hasEdgeImages, setHasEdgeImages] = useState(false);
  const [hasConventionalImages, setHasConventionalImages] = useState(false);

  let edgeURL = `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_EDGE_PARAMS}`;
  let conventionalURL = `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}`;

  if (groupName != undefined) {
    edgeURL = `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_EDGE_PARAMS}${INVENTORY_GROUP_NAME}${groupName}`;
    conventionalURL = `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}${INVENTORY_GROUP_NAME}${groupName}`;
  }
  useEffect(() => {
    if (isEdgeParityEnabled) {
      try {
        axios.get(`${edgeURL}`).then((result) => {
          const accountHasEdgeImages = result?.data?.total > 0;
          setHasEdgeImages(accountHasEdgeImages);
          axios.get(`${conventionalURL}`).then((conventionalImages) => {
            const accountHasConventionalImages =
              conventionalImages?.data?.total > 0;
            setHasConventionalImages(accountHasConventionalImages);

            if (
              groupName == undefined &&
              accountHasEdgeImages &&
              !accountHasConventionalImages
            ) {
              handleTabClick(undefined, hybridInventoryTabKeys.immutable.key);
            }
          });
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [isEdgeParityEnabled, groupName]);

  const activeTab = isImmutableTabOpen
    ? hybridInventoryTabKeys.immutable.key
    : hybridInventoryTabKeys.conventional.key;
  const handleTabClick = (_event, tabIndex) => {
    const pathWithParams =
      tabPathname +
      hybridInventoryTabKeys[tabIndex].url +
      (prevSearchRef.current || '');
    if (tabPathname != undefined && tabIndex !== activeTab) {
      prevSearchRef.current = search.toString();
      navigate(pathWithParams, {
        replace: true,
      });
    }
  };

  if (groupName == undefined) {
    return isEdgeParityEnabled && hasEdgeImages ? (
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
  } else {
    return isEdgeParityEnabled ? (
      <GroupTabDetails
        groupId={groupId}
        groupName={groupName}
        activeTab={
          hasConventionalImages
            ? hybridInventoryTabKeys.conventional.key
            : hybridInventoryTabKeys.immutable.key
        }
        hasEdgeImages={hasEdgeImages}
      />
    ) : (
      <EmptyStateNoAccessToSystems />
    );
  }
};

HybridInventoryTabs.propTypes = {
  ConventionalSystemsTab: PropTypes.element.isRequired,
  ImmutableDevicesTab: PropTypes.element.isRequired,
  isImmutableTabOpen: PropTypes.bool,
  tabPathname: PropTypes.string,
  isEdgeParityEnabled: PropTypes.bool,
  groupName: PropTypes.string,
  groupId: PropTypes.string,
};

HybridInventoryTabs.defaultProps = {
  tabPathname: '/insights/inventory',
  groupTabPathName: 'insights/inventory/groups',
};
export default HybridInventoryTabs;
