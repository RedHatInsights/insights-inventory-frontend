import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import { PageHeader, PageHeaderTitle, Main, routerParams } from '@red-hat-insights/insights-frontend-components';
import { entitiesReducer, addNewListener } from '../store';
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
        const {
            inventoryConnector,
            INVENTORY_ACTION_TYPES,
            mergeWithEntities
        } = await asyncInventoryLoader();
        this.getRegistry().register({
            ...mergeWithEntities(entitiesReducer)
        });

        const removeListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITIES,
            callback: ({ data }) => {
                // eslint-disable-next-line camelcase
                data.then(({ page, per_page }) => {
                    // eslint-disable-next-line camelcase
                    this.props.loadEntities({ page, per_page, filters: this.state.filters });
                });
            }
        });

        const { InventoryTable, updateEntities } = inventoryConnector();

        this.updateEntities = updateEntities;

        this.setState({
            ConnectedInventory: InventoryTable,
            removeListener
        });
    }

    onRefresh({ filters }) {
        this.setState({
            filters
        });
    }

    componentWillUnmount() {
        this.inventory && this.state.removeListener();
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
                            {ConnectedInventory &&
                                <ConnectedInventory
                                    filters={[
                                        {
                                            title: 'Health status', value: 'health-status', items: []
                                        },
                                        {
                                            title: 'Last seen', value: 'last-seen', items: []
                                        }
                                    ]}
                                    ref={this.inventory}
                                    onRefresh={this.onRefresh}
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
    addAlert: PropTypes.func,
    loadEntities: PropTypes.func,
    loadEntity: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {
        addAlert: (payload) => dispatch(actions.addAlert(payload)),
        loadEntities: (config) => dispatch(actions.loadEntities(config)),
        loadEntity: (id) => dispatch(actions.loadEntity(id))
    };
}

export default routerParams(connect(() => ({}), mapDispatchToProps)(Inventory));
