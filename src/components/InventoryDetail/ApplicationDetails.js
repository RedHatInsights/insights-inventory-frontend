import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, Tab } from '@patternfly/react-core';
import { detailSelect } from '../../store/actions';

/**
 * Component that renders tabs for each application detail and handles clicking on each item.
 * @param {*} props onTabSelect can be used to notify parent component that detail has been selected.
 */
const ApplicationDetails = ({ onTabSelect, appList, ...props }) => {
    const dispatch = useDispatch();
    const items = useSelector(({ entityDetails }) => {
        return (entityDetails?.activeApps || appList || []).filter(({ isVisible }) => isVisible !== false);
    });
    const disabledApps = useSelector(({ systemProfileStore }) => systemProfileStore?.disabledApps);
    const activeApp = useSelector(({ entityDetails }) => entityDetails?.activeApp?.appName || items?.[0]?.name);
    const [activeTabs, setActiveTabs] = useState(items);

    useEffect(() => {
        const filteredResult = items.filter(app => !disabledApps?.includes(app.name));
        if (filteredResult !== 0 && typeof filteredResult !== undefined) {
            setActiveTabs(filteredResult);
        }
        else {
            setActiveTabs(items);
        }
    }, [disabledApps]);

    return (
        <React.Fragment>
            {
                activeTabs?.length > 1 &&
                <Tabs
                    {...props}
                    activeKey={ activeApp }
                    onSelect={ (event, item) => {
                        const activeItem = activeTabs.find(oneApp => oneApp.name === item);
                        if (onTabSelect) {
                            onTabSelect(event, item, activeItem);
                        }

                        dispatch(detailSelect(activeItem.name));
                    } }
                    isFilled
                    className="ins-c-inventory-detail__app-tabs"
                >
                    { activeTabs?.map((item, key) => (
                        <Tab key={ key } eventKey={ item.name } title={ item.title }></Tab>
                    )) }
                </Tabs>
            }
        </React.Fragment>
    );
};

ApplicationDetails.propTypes = {
    appList: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        name: PropTypes.string.isRequired,
        pageId: PropTypes.string
    })),
    onTabSelect: PropTypes.func
};

export default ApplicationDetails;
