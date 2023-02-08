import React, { useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { loadEntity, deleteEntity } from '../../store/actions';
import './InventoryDetail.scss';
import SystemNotFound from './SystemNotFound';
import TopBar from './TopBar';
import FactsInfo from './FactsInfo';
import { reloadWrapper } from '../../Utilities/index';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import ApplicationDetails from './ApplicationDetails';
import './InventoryDetail.scss';
import InsightsPrompt from './InsightsPrompt';
import { verifyCulledInsightsClient } from '../../Utilities/sharedFunctions';

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
    inventoryId,
    children
}) => {
    const dispatch = useDispatch();
    const loaded = useSelector(({ entityDetails }) => entityDetails?.loaded || false);
    const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
    useEffect(() => {
        if (!entity || !(entity?.id === inventoryId) || !loaded) {
            dispatch(loadEntity(inventoryId, { hasItems: true }, { showTags }));
        }
    }, []);
    return <div className="ins-entity-detail">
        {loaded && !entity ? (
            <SystemNotFound
                onBackToListClick={onBackToListClick}
                inventoryId={inventoryId}
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
            {(loaded && verifyCulledInsightsClient(entity?.per_reporter_staleness)) && <InsightsPrompt />}
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
    ActionsWrapper: PropTypes.elementType,
    inventoryId: PropTypes.string
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

const InventoryDetailWrapper = ({ inventoryId, ...props }) => {
    const { inventoryId: entityId } = useParams();
    /*eslint-disable no-console*/
    if (!inventoryId) {
        console.warn('~~~~~~~~~~');
        console.warn('~~~~~~~~~~');
        console.warn('Missing inventoryId! Please provide one, we will remove the fallback from URL soon.');
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
