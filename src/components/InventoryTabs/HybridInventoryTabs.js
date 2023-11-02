import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { hybridInventoryTabKeys } from '../../Utilities/constants';
import { useNavigate } from 'react-router-dom';

const HybridInventoryTabs = ({
  ConventionalSystemsTab,
  ImmutableDevicesTab,
  tabPathname,
  isImmutableTabOpen,
  isEdgeParityEnabled,
  accountHasEdgeImages,
  hasConventionalSystems,
}) => {
  const { search } = useLocation();
  //used to hold URL params across tab changes
  const prevSearchRef = useRef('');
  const navigate = useNavigate();

  useEffect(() => {
    if (accountHasEdgeImages && !hasConventionalSystems) {
      handleTabClick(undefined, hybridInventoryTabKeys.immutable.key);
    }
  }, [accountHasEdgeImages, hasConventionalSystems]);

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

  return isEdgeParityEnabled && accountHasEdgeImages ? (
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
  isEdgeParityEnabled: PropTypes.bool,
  hasConventionalSystems: PropTypes.bool,
  accountHasEdgeImages: PropTypes.bool,
};

HybridInventoryTabs.defaultProps = {
  tabPathname: '/insights/inventory',
  hasConventionalSystems: true,
  accountHasEdgeImages: true,
};
export default HybridInventoryTabs;
