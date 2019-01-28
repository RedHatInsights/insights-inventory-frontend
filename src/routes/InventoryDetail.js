import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import { PageHeader, Main, routerParams } from '@red-hat-insights/insights-frontend-components';
import { Link } from 'react-router-dom';
import { entitesDetailReducer, addNewListener } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { registry as registryDecorator, Skeleton, SkeletonSize } from '@red-hat-insights/insights-frontend-components';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import '@red-hat-insights/insights-frontend-components/components/GeneralInformation.css';
import '@red-hat-insights/insights-frontend-components/components/Advisor.css';
import { routes } from '../Routes';

@registryDecorator()
class Inventory extends Component {

    constructor(props, ctx) {
        super(props, ctx);
        this.loadInventory();

        this.state = {};
    }

    async loadInventory() {
        const {
            inventoryConnector,
            INVENTORY_ACTION_TYPES,
            mergeWithDetail
        } = await asyncInventoryLoader();
        this.getRegistry().register({
            ...mergeWithDetail(entitesDetailReducer(INVENTORY_ACTION_TYPES))
        });

        const removeListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITY,
            callback: ({ data }) => {
                data.then(payload => {
                    payload.error && this.props.addAlert({ title: payload.error.message });
                    this.props.loadEntity(payload.results[0].id);
                    removeListener();
                });
            }
        });

        const { InventoryDetailHead, AppInfo, VulnerabilitiesStore } = inventoryConnector();

        VulnerabilitiesStore && this.getRegistry().register({ VulnerabilitiesStore });

        this.setState({
            InventoryDetail: InventoryDetailHead,
            AppInfo
        });
    }

    render() {
        const { InventoryDetail, AppInfo } = this.state;
        const { entity } = this.props;
        return (
            <Fragment>
                <PageHeader className="pf-m-light ins-inventory-detail">
                    <Breadcrumb>
                        <BreadcrumbItem><Link to={routes.table}>Inventory</Link></BreadcrumbItem>
                        <BreadcrumbItem isActive>
                            {
                                entity ?
                                    entity.display_name :
                                    <Skeleton size={SkeletonSize.xs} />
                            }
                        </BreadcrumbItem>
                    </Breadcrumb>
                    {InventoryDetail && <InventoryDetail hideBack />}
                </PageHeader>
                <Main>
                    <Grid gutter="md">
                        <GridItem span={12}>
                            {AppInfo && <AppInfo />}
                        </GridItem>
                    </Grid>
                </Main>
            </Fragment>
        );
    }
}

Inventory.contextTypes = {
    store: PropTypes.object
};

Inventory.propTypes = {
    history: PropTypes.object,
    entity: PropTypes.object,
    addAlert: PropTypes.func,
    loadEntities: PropTypes.func,
    loadEntity: PropTypes.func
};

function mapStateToProps({ entityDetails }) {
    return {
        entity: entityDetails && entityDetails.entity
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addAlert: (payload) => dispatch(actions.addAlert(payload)),
        loadEntities: () => dispatch(actions.loadEntities()),
        loadEntity: (id) => dispatch(actions.loadEntity(id))
    };
}

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Inventory));
