import {
    Bullseye,
    PageSection,
    Spinner,
    Tab,
    Tabs
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import GroupSystems from '../GroupSystems';
import GroupDetailHeader from './GroupDetailHeader';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const InventoryGroupDetail = ({ groupId }) => {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.groupDetail);
    const chrome = useChrome();
    const groupName = data?.results?.[0]?.name;

    useEffect(() => {
        dispatch(fetchGroupDetail(groupId));
    }, []);

    useEffect(() => {
    // if available, change ID to the group's name in the window title
        chrome?.updateDocumentTitle?.(
      `${groupName || groupId} - Inventory Groups | Red Hat Insights`
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
                        title='Systems'
                        aria-label="Group systems tab"
                    >
                        <PageSection>
                            <GroupSystems groupName={groupName} groupId={groupId}/>
                        </PageSection>
                    </Tab>
                    <Tab
                        eventKey={1}
                        title='Group info'
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
