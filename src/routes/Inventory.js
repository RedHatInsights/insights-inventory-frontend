import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import {
    PageHeader,
    PageHeaderTitle,
    Section
} from '@red-hat-insights/insights-frontend-components';
import { Button } from '@patternfly/react-core';
import { asyncReducers, addNewListener } from '../store';
import * as actions from '../actions';
import { Card, CardBody, Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import registryDecorator from '@red-hat-insights/insights-frontend-components/Utilities/Registry';

@registryDecorator()
class Inventory extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.loadInventory();
        this.alert1 = () => this.props.addAlert({ title: 'Dismissible alert', dismissible: true });
        this.alert2 = () => this.props.addAlert({ title: 'Non-dismissible alert', dismissible: false });

        this.state = {
            ConnectedInventory: () => <div>Loading..</div>
        };
    }

    async loadInventory() {
        this.getRegistry().register(await asyncReducers());
        const { inventoryConnector, INVENTORY_ACTION_TYPES } = await asyncInventoryLoader();
        this.entitiesListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITIES,
            callback: this.props.loadEntities
        });

        this.entityListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITY,
            callback: ({ data }) => {
                data.then(payload => {
                    payload.error && this.props.addAlert({ title: payload.error.message });
                    this.props.loadEntity(payload.id);
                });
            }
        });

        this.setState({
            ConnectedInventory: inventoryConnector()
        });
    }

    componentWillUnmount() {
        this.entitiesListener();
    }

    render() {
        const { ConnectedInventory } = this.state;
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Inventory'/>
                </PageHeader>
                <Section type='content'>
                    <Grid gutter="md">
                        <GridItem span={12}>
                            <Card>
                                <CardBody>
                                    <ConnectedInventory />
                                </CardBody>
                            </Card>
                        </GridItem>
                        <GridItem span={12}>
                            <Card>
                                <CardBody>
                                    <div className='buttons'>
                                        <Button variant='secondary' onClick={this.alert1}>Dismissible alert</Button>
                                        <Button variant='secondary' onClick={this.alert2}>Non-dismissible alert</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </Section>
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

export default withRouter(connect(() => ({}), mapDispatchToProps)(Inventory));
