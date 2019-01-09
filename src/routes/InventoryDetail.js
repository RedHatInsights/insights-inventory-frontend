import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import { PageHeader, PageHeaderTitle, Main, routerParams } from '@red-hat-insights/insights-frontend-components';
import { entitesDetailReducer, addNewListener } from '../store';
import * as actions from '../actions';
import { Card, CardBody, Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { registry as registryDecorator } from '@red-hat-insights/insights-frontend-components';
import '@red-hat-insights/insights-frontend-components/components/GeneralInformation.css';

@registryDecorator()
class Inventory extends Component {

    constructor(props, ctx) {
        super(props, ctx);
        this.loadInventory();

        this.state = {
            InventoryDetail: () => <div>Loading..</div>
        };
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

        this.entityListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITY,
            callback: ({ data }) => {
                data.then(payload => {
                    payload.error && this.props.addAlert({ title: payload.error.message });
                    this.props.loadEntity(payload.results[0].id);
                });
            }
        });

        const { InventoryDetail, VulnerabilitiesStore } = inventoryConnector();

        this.getRegistry().register({ VulnerabilitiesStore });

        this.setState({
            InventoryDetail
        });
    }

    componentWillUnmount() {
        this.entityListener();
    }

    render() {
        const { InventoryDetail } = this.state;
        return (
            <React.Fragment>
                <PageHeader className="pf-m-light">
                    <PageHeaderTitle title='Inventory' />
                </PageHeader>
                <Main>
                    <Grid gutter="md">
                        <GridItem span={12}>
                            <Card>
                                <CardBody>
                                    <InventoryDetail />
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </Main>
            </React.Fragment>
        );
    }
}

Inventory.contextTypes = {
    store: PropTypes.object
};

Inventory.propTypes = {
    addAlert: PropTypes.func,
    loadEntities: PropTypes.func,
    loadEntity: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {
        addAlert: (payload) => dispatch(actions.addAlert(payload)),
        loadEntities: () => dispatch(actions.loadEntities()),
        loadEntity: (id) => dispatch(actions.loadEntity(id))
    };
}

export default routerParams(connect(() => ({}), mapDispatchToProps)(Inventory));
