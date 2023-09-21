import React, { Suspense, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useStore } from 'react-redux';
import { Spinner, Tab, TabContent, Tabs } from '@patternfly/react-core';
import { verifyCulledReporter } from '../../Utilities/sharedFunctions';
import { getFact } from './helpers';
import { NotConnected } from '@redhat-cloud-services/frontend-components/NotConnected';
import {
  APP_NAME_ADVISOR,
  APP_NAME_PATCH,
  APP_NAME_VULNERABILITY,
  REPORTER_PUPTOO,
  REPORTER_RHSM_CONDUIT,
  REPORTER_RHSM_PROFILE_BRIDGE,
} from '../../Utilities/constants';

/**
 * Component that renders tabs for each application detail and handles clicking on each item.
 * @param {*} props onTabSelect can be used to notify parent component that detail has been selected.
 */
const ApplicationDetails = ({
  onTabSelect,
  appList,
  activeApp,
  inventoryId,
  entity,
  ...props
}) => {
  const store = useStore();
  const items = useSelector(({ entityDetails }) => {
    return (entityDetails?.activeApps || appList || [])
      .filter(({ isVisible }) => isVisible !== false)
      .map((app) => ({
        ...app,
        tabRef: React.createRef(),
      }));
  });
  const disabledApps = useSelector(
    ({ systemProfileStore }) => systemProfileStore?.disabledApps
  );
  const [activeTabs, setActiveTabs] = useState(items);
  const [currentApp, setCurrentApp] = useState(activeApp || items?.[0]?.name);

  const perReporterStaleness = getFact('per_reporter_staleness', entity);

  useEffect(() => {
    const filteredResult = items.filter(
      (app) => !disabledApps?.includes(app.name)
    );
    if (filteredResult !== 0 && typeof filteredResult !== 'undefined') {
      setActiveTabs(filteredResult);
    } else {
      setActiveTabs(items);
    }
    setCurrentApp(activeApp || items?.[0]?.name);
  }, [disabledApps, appList]);

  const isDisconnected = useMemo(
    () => verifyCulledReporter(perReporterStaleness, REPORTER_PUPTOO),
    [currentApp]
  );

  const isRHSMSystem = useMemo(() => {
    const rhsmConduit =
      !!perReporterStaleness?.[REPORTER_RHSM_CONDUIT] &&
      !verifyCulledReporter(perReporterStaleness, REPORTER_RHSM_CONDUIT);
    const rhsmBridge = !!perReporterStaleness?.[REPORTER_RHSM_PROFILE_BRIDGE];
    return rhsmBridge && rhsmConduit;
  }, [currentApp]);

  const isEmptyState = (currentApp) =>
    (currentApp === APP_NAME_ADVISOR && isDisconnected) ||
    (currentApp === APP_NAME_VULNERABILITY &&
      !isRHSMSystem &&
      isDisconnected) ||
    (currentApp === APP_NAME_PATCH && !isRHSMSystem && isDisconnected);

  return (
    <React.Fragment>
      <section className="pf-u-pr-lg pf-u-pl-lg pf-u-background-color-100-on-md">
        <Tabs
          {...props}
          activeKey={currentApp}
          onSelect={(event, item) => {
            const activeItem = activeTabs.find(
              (oneApp) => oneApp.name === item
            );
            if (onTabSelect) {
              onTabSelect(event, item, activeItem.name || item);
            }

            setCurrentApp(activeItem.name);
          }}
          className="ins-c-inventory-detail__app-tabs"
          inset={'insetMd'}
        >
          {activeTabs?.map((item, key) => (
            <Tab
              key={key}
              eventKey={item.name}
              title={item.title}
              tabContentRef={item.tabRef}
              {...item}
            />
          ))}
        </Tabs>
      </section>
      <section>
        {activeTabs?.length > 0 &&
          activeTabs?.map((item) => {
            const Cmp = item.component;
            return (
              <TabContent
                eventKey={item.name}
                id={item.name}
                ref={item.tabRef}
                aria-label={item.title}
                key={item.name}
              >
                {item.name === currentApp && (
                  <Suspense fallback={Spinner}>
                    <section className="pf-c-page__main-section">
                      {isEmptyState(currentApp) ? (
                        <NotConnected />
                      ) : (
                        <Cmp
                          inventoryId={inventoryId}
                          store={store}
                          {...item}
                        />
                      )}
                    </section>
                  </Suspense>
                )}
              </TabContent>
            );
          })}
      </section>
    </React.Fragment>
  );
};

ApplicationDetails.propTypes = {
  appList: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node,
      name: PropTypes.string.isRequired,
      pageId: PropTypes.string,
    })
  ),
  onTabSelect: PropTypes.func,
  activeApp: PropTypes.string.isRequired,
  inventoryId: PropTypes.string.isRequired,
  entity: PropTypes.object,
};

export default ApplicationDetails;
