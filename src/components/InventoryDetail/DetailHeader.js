import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import './InventoryDetail.scss';
import TopBar from './TopBar';
import FactsInfo from './FactsInfo';
import './InventoryDetail.scss';
import InsightsPrompt from './InsightsPrompt';
import { verifyCulledInsightsClient } from '../../Utilities/sharedFunctions';
import { PageHeader } from '@redhat-cloud-services/frontend-components';
import classnames from 'classnames';

const DetailHeader = ({
    entity,
    hideInvLink,
    loaded,
    addNotification,
    deleteEntity,
    onBackToListClick,
    actions,
    UUIDWrapper,
    LastSeenWrapper,
    children,
    showInventoryDrawer,
    shouldWrapAsPage,
    BreadcrumbWrapper,
    additionalClasses,
    showDelete,
    showTags,
    TitleWrapper,
    TagsWrapper,
    DeleteWrapper,
    ActionsWrapper
}) => {
    const HeaderInfo = (<Fragment>
        <TopBar
            entity={entity}
            loaded={loaded}
            onBackToListClick={onBackToListClick}
            actions={actions}
            deleteEntity={deleteEntity}
            addNotification={addNotification}
            hideInvLink={hideInvLink}
            showInventoryDrawer={showInventoryDrawer}
            showDelete={showDelete}
            showTags={showTags}
            TitleWrapper={TitleWrapper}
            TagsWrapper={TagsWrapper}
            DeleteWrapper={DeleteWrapper}
            ActionsWrapper={ActionsWrapper}
        />
        <FactsInfo
            loaded={loaded}
            entity={entity}
            UUIDWrapper={UUIDWrapper}
            LastSeenWrapper={LastSeenWrapper}
        />
        {(loaded && verifyCulledInsightsClient(entity?.per_reporter_staleness)) && <InsightsPrompt />}
        {children}
    </Fragment>);

    return (shouldWrapAsPage ?
        (<PageHeader className={classnames('pf-m-light ins-inventory-detail', additionalClasses)} >
            {BreadcrumbWrapper}
            {HeaderInfo}
        </PageHeader>) : HeaderInfo);
};

DetailHeader.propTypes = {
    hideInvLink: PropTypes.bool,
    showTags: PropTypes.bool,
    showDelete: PropTypes.bool,
    showInventoryDrawer: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.node,
        onClick: PropTypes.func,
        key: PropTypes.string
    })),
    onBackToListClick: PropTypes.func,
    children: PropTypes.node,
    UUIDWrapper: PropTypes.elementType,
    LastSeenWrapper: PropTypes.elementType,
    TitleWrapper: PropTypes.elementType,
    TagsWrapper: PropTypes.elementType,
    DeleteWrapper: PropTypes.elementType,
    ActionsWrapper: PropTypes.elementType,
    BreadcrumbWrapper: PropTypes.elementType,
    inventoryId: PropTypes.string,
    shouldWrapAsPage: PropTypes.bool,
    additionalClasses: PropTypes.object,
    entity: PropTypes.object,
    loaded: PropTypes.bool,
    addNotification: PropTypes.func,
    deleteEntity: PropTypes.func
};

export default DetailHeader;
