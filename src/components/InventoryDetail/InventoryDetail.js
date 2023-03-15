import React, { useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { loadEntity, deleteEntity as deleteEntityAction } from '../../store/actions';
import './InventoryDetail.scss';
import SystemNotFound from './SystemNotFound';
import { reloadWrapper } from '../../Utilities/index';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/redux';
import ApplicationDetails from './ApplicationDetails';
import './InventoryDetail.scss';
import DetailHeader from './DetailHeader';

/**
 * Composit component which tangles together Topbar, facts, tags, app details and if system is found or not.
 * This component is connected to redux and reads `loaded` and `entity`.
 * @param {*} props additional features from parent component.
 */
const InventoryDetail = ({
    showTags,
    onTabSelect,
    onBackToListClick,
    inventoryId,
    additionalClasses,
    activeApp,
    appList,
    showMainSection,
    ...headerProps
}) => {
    const dispatch = useDispatch();
    const loaded = useSelector(({ entityDetails }) => entityDetails?.loaded || false);
    const entity = useSelector(({ entityDetails }) => entityDetails?.entity);

    //TODO: one all apps migrate to away from AppAinfo, remove this
    useEffect(() => {
        if (!entity || !(entity?.id === inventoryId) || !loaded) {
            dispatch(loadEntity(inventoryId, { hasItems: true }, { showTags }));
        }
    }, []);
    const deleteEntity = (systems, displayName, callback) => {
        const action = deleteEntityAction(systems, displayName);
        dispatch(reloadWrapper(action, callback));
    };

    const addNotification = (payload) => dispatch(addNotificationAction(payload));

    return <div className="ins-entity-detail">
        {loaded && !entity ? (
            <SystemNotFound
                onBackToListClick={onBackToListClick}
                inventoryId={inventoryId}
            />
        ) : (
            <>
                <DetailHeader
                    entity={entity}
                    loaded={loaded}
                    onBackToListClick={onBackToListClick}
                    deleteEntity={deleteEntity}
                    addNotification={addNotification}
                    showTags={showTags}
                    {...headerProps}
                />
                {showMainSection && (
                    <ApplicationDetails
                        onTabSelect={onTabSelect}
                        activeApp={activeApp}
                        appList={appList}
                        inventoryId={inventoryId}
                        entity={entity}
                    />
                )}
            </>)
        }

    </div>;
};

InventoryDetail.propTypes = {
    showTags: PropTypes.bool,
    onTabSelect: PropTypes.func,
    onBackToListClick: PropTypes.func,
    inventoryId: PropTypes.string,
    additionalClasses: PropTypes.object,
    activeApp: PropTypes.string,
    appList: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        name: PropTypes.string.isRequired,
        pageId: PropTypes.string
    }))
};
InventoryDetail.defaultProps = {
    actions: [],
    hideInvLink: false,
    showTags: false,
    UUIDWrapper: Fragment,
    LastSeenWrapper: Fragment,
    TitleWrapper: Fragment,
    TagsWrapper: Fragment,
    DeleteWrapper: Fragment,
    ActionsWrapper: Fragment,
    appList: []
};

const InventoryDetailWrapper = ({ inventoryId, ...props }) => {
    const { inventoryId: entityId } = useParams();
    /*eslint-disable no-console*/
    if (!inventoryId) {
        console.warn('~~~~~~~~~~');
        console.warn('~~~~~~~~~~');
        console.warn('Missing inventoryId! Please provide one, we will remove the fallback from URL soon.');
        console.warn(`Please use DetailHead component in the fed-mod to render 
            only Inventory header. Migrate away InventoryDetailHead`);
        console.warn('~~~~~~~~~~');
        console.warn('~~~~~~~~~~');
    }
    /*eslint-enable no-console*/

    return <InventoryDetail
        inventoryId={inventoryId || entityId || location.pathname.replace(/\/$/, '').split('/').pop()}
        {...props}
    />;
};

InventoryDetailWrapper.propTypes = InventoryDetail.propTypes;

// TODO: Remove once all apps send `inventoryId` and use directly InventoryDetail
const InventoryDetailCmp = (props) => props.inventoryId ? <InventoryDetail {...props} /> : <InventoryDetailWrapper {...props} />;

InventoryDetailCmp.propTypes = InventoryDetail.propTypes;

export default InventoryDetailWrapper;
