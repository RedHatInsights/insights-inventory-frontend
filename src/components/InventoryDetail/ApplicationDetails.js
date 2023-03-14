import React, { useState, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useStore } from 'react-redux';
import { Tabs, Tab, Spinner, TabContent } from '@patternfly/react-core';
import { verifyCulledInsightsClient } from '../../Utilities/sharedFunctions';
import { getFact } from './helpers';
import { NotConnected } from '@redhat-cloud-services/frontend-components/NotConnected';

/**
 * Component that renders tabs for each application detail and handles clicking on each item.
 * @param {*} props onTabSelect can be used to notify parent component that detail has been selected.
 */
const ApplicationDetails = ({ onTabSelect, appList, activeApp, inventoryId, entity, ...props }) => {
    const store = useStore();
    const items = useSelector(({ entityDetails }) => {
        return (entityDetails?.activeApps || appList || [])
        .filter(({ isVisible }) => isVisible !== false)
        .map(app => ({
            ...app,
            tabRef: React.createRef()
        }));
    });
    const disabledApps = useSelector(({ systemProfileStore }) => systemProfileStore?.disabledApps);
    const [activeTabs, setActiveTabs] = useState(items);
    const [currentApp, setCurrentApp] = useState(activeApp || items?.[0]?.name);

    useEffect(() => {
        const filteredResult = items.filter(app => !disabledApps?.includes(app.name));
        if (filteredResult !== 0 && typeof filteredResult !== undefined) {
            setActiveTabs(filteredResult);
        }
        else {
            setActiveTabs(items);
        }
    }, [disabledApps]);

    const isDisconnected = verifyCulledInsightsClient(getFact('per_reporter_staleness', entity));

    return (
        <React.Fragment>
            <section className='pf-u-pr-lg pf-u-pl-lg pf-u-background-color-100-on-md'>
                <Tabs
                    {...props}
                    activeKey={currentApp}
                    onSelect={(event, item) => {
                        const activeItem = activeTabs.find(oneApp => oneApp.name === item);
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
                        />
                    ))}
                </Tabs>
            </section>
            <section>
                {activeTabs?.length && activeTabs?.map((item) => {
                    const Cmp = item.component;
                    return (
                        <TabContent
                            eventKey={item.name}
                            id={item.name}
                            ref={item.tabRef}
                            aria-label={item.title}
                            key={item.name}
                        >
                            {item.name === currentApp && <Suspense fallback={Spinner}>
                                <section className='pf-c-page__main-section'>
                                    {isDisconnected && ['patch', 'vulnerabilities', 'advisor']
                                    .includes(currentApp) ? <NotConnected/>
                                        : <Cmp
                                            inventoryId={inventoryId}
                                            store={store}
                                        />}
                                </section>
                            </Suspense>}
                        </TabContent>
                    );}
                )}
            </section>
        </React.Fragment>
    );
};

ApplicationDetails.propTypes = {
    appList: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        name: PropTypes.string.isRequired,
        pageId: PropTypes.string
    })),
    onTabSelect: PropTypes.func,
    activeApp: PropTypes.string.isRequired,
    inventoryId: PropTypes.string.isRequired,
    entity: PropTypes.object
};

export default ApplicationDetails;
