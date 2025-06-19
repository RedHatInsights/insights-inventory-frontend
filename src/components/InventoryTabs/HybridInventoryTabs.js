import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import {
  Tab,
  TabTitleText,
  Tabs,
  Alert,
  Text,
  TextContent,
  Button,
} from '@patternfly/react-core';
import { hybridInventoryTabKeys } from '../../Utilities/constants';
import { useNavigate } from 'react-router-dom';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

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
      className="pf-m-light pf-v5-c-table"
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
        <Alert
          variant="info"
          isInline
          title={<>Upcoming decommission of hosted edge management service</>}
          className="pf-v5-u-mt-sm pf-v5-u-mb-sm"
        >
          <TextContent>
            <Text>
              As of July 31, 2025, the hosted edge management service will no
              longer be supported. Consequently, pushing image updates to
              Immutable (OSTree) systems via the Hybrid Cloud Console using this
              service will be discontinued. Customers are encouraged to explore
              Red Hat Edge Manager (RHEM) as the recommended alternative for
              managing their edge systems.
            </Text>
            <Text>
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                isInline
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/managing_device_fleets_with_the_red_hat_edge_manager/index'
                }
              >
                Red Hat Edge Manager (RHEM) documentation
              </Button>
            </Text>
          </TextContent>
        </Alert>
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
