import React, { useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { loadEntity, deleteEntity, setRosTabVisibility } from '../../store/actions';
import './InventoryDetail.scss';
import SystemNotFound from './SystemNotFound';
import TopBar from './TopBar';
import FactsInfo from './FactsInfo';
import { reloadWrapper } from '../../Utilities/index';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import ApplicationDetails from './ApplicationDetails';
import { getEntitySystemProfile } from '../../api/api';
import './InventoryDetail.scss';

/**
 * Composit component which tangles together Topbar, facts, tags, app details and if system is found or not.
 * This component is connected to redux and reads `loaded` and `entity`.
 * @param {*} props additional features from parent component.
 */
const InventoryDetail = ({
    actions,
    showTags,
    hideInvLink,
    onTabSelect,
    onBackToListClick,
    showDelete,
    appList,
    showInventoryDrawer,
    UUIDWrapper,
    LastSeenWrapper,
    TitleWrapper,
    TagsWrapper,
    DeleteWrapper,
    ActionsWrapper,
    children
}) => {
    const { inventoryId } = useParams();
    const dispatch = useDispatch();
    const loaded = useSelector(({ entityDetails }) => entityDetails?.loaded || false);
    const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
    const activeApps = useSelector(({ entityDetails }) => entityDetails);
    useEffect(() => {
        const currId = inventoryId || location.pathname.replace(/\/$/, '').split('/').pop();
        if (!entity || !(entity?.id === currId) || !loaded) {
            const action = loadEntity(currId, { hasItems: true }, { showTags });
            dispatch(action);
            action.payload.then((data) => {
                getEntitySystemProfile(currId).then(result => {
                    const cloudProviderObj = (typeof result.results[0].system_profile.cloud_provider === 'undefined'
                        ? 'nope'
                        : result.results[0].system_profile.cloud_provider
                    );
                    (cloudProviderObj === 'aws' || cloudProviderObj === 'azure')
                        ? dispatch(setRosTabVisibility(false))
                        : dispatch(setRosTabVisibility(true));
                    console.log('TESTING ++++++++++ systemProfile in InventoryDetail: ', cloudProviderObj);
                    return result;
                });
            });
            console.log('TESTING +++++++++ activeAppos in InvDet/InvDet: ', activeApps);
        }
    }, []);
    return <div className="ins-entity-detail">
        {loaded && !entity ? (
            <SystemNotFound
                onBackToListClick={onBackToListClick}
                inventoryId={location.pathname.split('/')[location.pathname.split('/').length - 1]}
            />
        ) : <Fragment>
            <TopBar
                entity={ entity }
                loaded={ loaded }
                onBackToListClick={ onBackToListClick }
                actions={ actions }
                deleteEntity={ (systems, displayName, callback) => {
                    const action = deleteEntity(systems, displayName);
                    dispatch(reloadWrapper(action, callback));
                } }
                addNotification={ (payload) => dispatch(addNotification(payload))}
                hideInvLink={ hideInvLink }
                showInventoryDrawer={ showInventoryDrawer }
                showDelete={ showDelete }
                showTags={ showTags }
                TitleWrapper={TitleWrapper}
                TagsWrapper={TagsWrapper}
                DeleteWrapper={DeleteWrapper}
                ActionsWrapper={ActionsWrapper}
            />
            <FactsInfo
                loaded={ loaded }
                entity={ entity }
                UUIDWrapper={UUIDWrapper}
                LastSeenWrapper={LastSeenWrapper}
            />
            {children}
        </Fragment>
        }
        {loaded && entity && (
            <ApplicationDetails onTabSelect={ onTabSelect } appList={ appList } />
        )}
    </div>;
};

InventoryDetail.propTypes = {
    hideInvLink: PropTypes.bool,
    hideBack: PropTypes.bool,
    showTags: PropTypes.bool,
    showDelete: PropTypes.bool,
    showInventoryDrawer: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        onClick: PropTypes.func,
        key: PropTypes.string
    })),
    appList: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        name: PropTypes.string,
        pageId: PropTypes.string
    })),
    onTabSelect: PropTypes.func,
    onBackToListClick: PropTypes.func,
    children: PropTypes.node,
    UUIDWrapper: PropTypes.elementType,
    LastSeenWrapper: PropTypes.elementType,
    TitleWrapper: PropTypes.elementType,
    TagsWrapper: PropTypes.elementType,
    DeleteWrapper: PropTypes.elementType,
    ActionsWrapper: PropTypes.elementType
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
    ActionsWrapper: Fragment
};

export default InventoryDetail;
