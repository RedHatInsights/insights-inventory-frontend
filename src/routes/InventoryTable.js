import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import { PageHeader, PageHeaderTitle, Main, routerParams } from '@red-hat-insights/insights-frontend-components';
import { entitiesReducer } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { registry as registryDecorator } from '@red-hat-insights/insights-frontend-components';

@registryDecorator()
class Inventory extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.loadInventory();
        this.inventory = React.createRef();
        this.state = {
            removeListener: () => undefined
        };
        this.onRefresh = this.onRefresh.bind(this);
    }

    async loadInventory() {
        this.props.clearNotifications();
        const {
            inventoryConnector,
            mergeWithEntities
        } = await asyncInventoryLoader();
        this.getRegistry().register({
            ...mergeWithEntities(entitiesReducer)
        });

        const { InventoryTable, updateEntities } = inventoryConnector();

        this.updateEntities = updateEntities;

        this.setState({
            ConnectedInventory: InventoryTable
        });
    }

    onRefresh(options) {
        this.setState({
            filters: options.filters
        }, () => this.inventory.current.onRefreshData(options, false));
    }

    render() {
        const { ConnectedInventory } = this.state;
        return (
            <React.Fragment>
                <PageHeader className="pf-m-light">
                    <PageHeaderTitle title='Inventory'/>
                </PageHeader>
                <Main>
                    <Grid gutter="md">
                        <GridItem span={12}>
                            {
                                ConnectedInventory &&
                                <ConnectedInventory
                                    ref={this.inventory}
                                    onRefresh={this.onRefresh}
                                    hasCheckbox={false}
                                />
                            }
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
    loadEntities: PropTypes.func,
    loadEntity: PropTypes.func,
    clearNotifications: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {
        loadEntities: (config) => dispatch(actions.loadEntities(config)),
        loadEntity: (id) => dispatch(actions.loadEntity(id)),
        clearNotifications: () => dispatch(actions.clearNotifications())
    };
}

export default routerParams(connect(() => ({}), mapDispatchToProps)(Inventory));
