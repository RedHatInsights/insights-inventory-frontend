import React, { lazy, Suspense, useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import {
    Bullseye,
    PageSection,
    Spinner,
    Tab,
    Tabs,
    TabTitleText
} from '@patternfly/react-core';
import { useState } from 'react';
import GroupDetailHeader from './GroupDetailHeader';
import GroupDetailSystems from './GroupDetailSystems';
import PropTypes from 'prop-types';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const InventoryGroupDetail = ({ groupId }) => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.groupDetail);
    const chrome = useChrome();

    useEffect(() => {
        dispatch(fetchGroupDetail(groupId));
    }, []);

    useEffect(() => {
    // if available, change ID to the group's name in the window title
        chrome?.updateDocumentTitle?.(
      `${data?.name || groupId} - Inventory Groups | Red Hat Insights`
        );
    }, [data]);

    const [activeTabKey, setActiveTabKey] = useState(0);

    // TODO: append search parameter to identify the active tab

    return (
        <React.Fragment>
            <GroupDetailHeader groupId={groupId} />
            <PageSection variant="light" type="tabs">
                <Tabs
                    activeKey={activeTabKey}
                    onSelect={(event, value) => setActiveTabKey(value)}
                    aria-label="Group tabs"
                    role="region"
                    inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
                >
                    <Tab
                        eventKey={0}
                        title={<TabTitleText>Systems</TabTitleText>}
                        aria-label="Group systems tab"
                    >
                        <PageSection>
                            <GroupDetailSystems />
                        </PageSection>
                    </Tab>
                    <Tab
                        eventKey={1}
                        title={<TabTitleText>Group info</TabTitleText>}
                        aria-label="Group info tab"
                    >
                        {activeTabKey === 1 && ( // helps to lazy load the component
                            <PageSection>
                                <Suspense
                                    fallback={
                                        <Bullseye>
                                            <Spinner />
                                        </Bullseye>
                                    }
                                >
                                    <GroupDetailInfo />
                                </Suspense>
                            </PageSection>
                        )}
                    </Tab>
                </Tabs>
            </PageSection>
        </React.Fragment>
    );
};

InventoryGroupDetail.propTypes = {
    groupId: PropTypes.string.isRequired
};

export default InventoryGroupDetail;
