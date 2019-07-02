import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';
import { entitiesReducer } from '../store';
import * as actions from '../actions';
import {
    Grid,
    GridItem,
    Modal,
    Button,
    Split,
    SplitItem,
    Level,
    LevelItem,
    Stack,
    StackItem,
    ClipboardCopy
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import registryDecorator from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
@registryDecorator()
class Inventory extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.loadInventory();
        this.inventory = React.createRef();
        this.state = {
            isModalOpen: false,
            removeListener: () => undefined
        };
        this.onDeleteHost = this.onDeleteHost.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this.handleModalToggle = this.handleModalToggle.bind(this);
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

    handleModalToggle() {
        this.setState(({ isModalOpen }) => ({
            isModalOpen: !isModalOpen
        }));
    };

    onDeleteHost(id, displayName) {
        this.setState(({ isModalOpen }) => ({
            isModalOpen: !isModalOpen,
            id,
            displayName
        }));
    }

    render() {
        const { ConnectedInventory, isModalOpen, displayName, id, filters } = this.state;
        const { deleteEntity, addNotification } = this.props;
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
                                    actions={[
                                        {
                                            title: 'Delete',
                                            onClick: (_event, _index, { id: systemId, display_name: displayName }) =>
                                                this.onDeleteHost(systemId, displayName)
                                        }
                                    ]}
                                />
                            }
                        </GridItem>
                    </Grid>
                </Main>
                <Modal
                    isSmall
                    title="Remove from inventory"
                    className="ins-c-inventory__table--remove"
                    isOpen={isModalOpen}
                    onClose={this.handleModalToggle}
                >
                    <Split gutter="md">
                        <SplitItem><ExclamationTriangleIcon size="xl" className="ins-m-alert"/></SplitItem>
                        <SplitItem isFilled>
                            <Stack gutter="md">
                                <StackItem>
                                    {displayName} will be removed from
                                    all {location.host} applications and services. You need to re-register
                                    the system to add it back to your inventory.
                                </StackItem>
                                <StackItem>
                                    To disable the daily upload for this system, use the following command:
                                </StackItem>
                                <StackItem>
                                    <ClipboardCopy>insights-client --unregister</ClipboardCopy>
                                </StackItem>
                            </Stack>
                        </SplitItem>
                    </Split>
                    <Level gutter="md">
                        <LevelItem>
                            <Button variant="danger" onClick={() => {
                                addNotification({
                                    id: 'remove-initiated',
                                    variant: 'warning',
                                    title: 'Delete operation initiated',
                                    description: `Removal of ${displayName} started.`,
                                    dismissable: false
                                });
                                deleteEntity(id, displayName, () => this.onRefresh({ filters }));
                                this.handleModalToggle();
                            }}>
                                Remove
                            </Button>
                            <Button variant="link" onClick={this.handleModalToggle}>Cancel</Button>
                        </LevelItem>
                    </Level>
                </Modal>
            </React.Fragment>
        );
    }
}

Inventory.contextTypes = {
    store: PropTypes.object
};

Inventory.propTypes = {
    loadEntity: PropTypes.func,
    clearNotifications: PropTypes.func,
    deleteEntity: PropTypes.func,
    addNotification: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    const reloadWrapper = (event, callback) => {
        event.payload.then(callback);
        return event;
    };

    return {
        loadEntity: (id) => dispatch(actions.loadEntity(id)),
        clearNotifications: () => dispatch(actions.clearNotifications()),
        deleteEntity: (id, hostName, callback) => dispatch(reloadWrapper(actions.deleteEntity(id, hostName), callback)),
        addNotification: (payload) => dispatch(addNotification(payload))
    };
}

export default routerParams(connect(() => ({}), mapDispatchToProps)(Inventory));
