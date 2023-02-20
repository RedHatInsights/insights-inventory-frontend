import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import { PageSection, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useState } from 'react';
import GroupDetailHeader from './GroupDetailHeader';
import GroupDetailSystems from './GroupDetailSystems';
import GroupDetailInfo from './GroupDetailInfo';

const InventoryGroupDetail = () => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.groupDetail);
    const chrome = useChrome();

    const { groupId } = useParams();

    useEffect(() => {
        dispatch(fetchGroupDetail(groupId));
    }, []);

    useEffect(() => {
        // if available, change ID to the group's name in the window title
        chrome.updateDocumentTitle(
            `${data?.name || groupId} - Inventory Groups | Red Hat Insights`
        );
    }, [data]);

    const [activeTabKey, setActiveTabKey] = useState(0);

    return (
        <React.Fragment>
            <GroupDetailHeader />
            <PageSection variant='light' type='tabs'>
                <Tabs
                    activeKey={activeTabKey}
                    onSelect={(event, value) => setActiveTabKey(value)}
                    aria-label="Group tabs"
                    role="region"
                    inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
                >
                    <Tab eventKey={0} title={<TabTitleText>Systems</TabTitleText>} aria-label="Group systems tab">
                        <PageSection>
                            <GroupDetailSystems />
                        </PageSection>
                    </Tab>
                    <Tab eventKey={1} title={<TabTitleText>Group info</TabTitleText>} aria-label="Group info tab">
                        <PageSection>
                            <GroupDetailInfo />
                        </PageSection>
                    </Tab>
                </Tabs>

            </PageSection>
        </React.Fragment>
    );
};

export default InventoryGroupDetail;
