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

const HeaderInfo = ({ entity, loaded, UUIDWrapper, LastSeenWrapper, children, ...props }) => (<Fragment>
    <TopBar
        entity={entity}
        loaded={loaded}
        {...props}
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

const DetailHeader = ({ shouldWrapAsPage, BreadcrumbWrapper, additionalClasses, ...props }) => {
    return (shouldWrapAsPage ?
        (<PageHeader className={classnames('pf-m-light ins-inventory-detail', additionalClasses)} >
            {BreadcrumbWrapper}
            <HeaderInfo {...props}/>
        </PageHeader>) : <HeaderInfo  {...props} />);
};

HeaderInfo.propTypes = {
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
    inventoryId: PropTypes.string,
    deleteEntity: PropTypes.func,
    entity: PropTypes.object,
    loaded: PropTypes.bool,
    addNotification: PropTypes.func
};
DetailHeader.propTypes = {
    BreadcrumbWrapper: PropTypes.elementType,
    shouldWrapAsPage: PropTypes.bool,
    additionalClasses: PropTypes.object
};

export default DetailHeader;
