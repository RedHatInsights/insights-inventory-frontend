import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';
import { entitiesReducer } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import DeleteModal from '../components/DeleteModal';
import TextInputModal from '@redhat-cloud-services/frontend-components-inventory-general-info/TextInputModal';

const calculateChecked = (rows, selected) => {
    if (!rows || rows.length <= 0) {
        return false;
    }

    return rows.every(({ id }) => selected && selected.has(id))
        ? true
        : rows.some(({ id }) => selected && selected.has(id)) && null;
};

const Inventory = ({
    clearNotifications,
    deleteEntity,
    addNotification,
    loaded,
    rows,
    updateDisplayName,
    onSelectRows,
    selected
}) => {
    const inventory = useRef(null);
    const [ConnectedInventory, setInventory] = useState();
    const [isModalOpen, handleModalToggle] = useState(false);
    const [currentSytem, activateSystem] = useState({});
    const [filters, onSetfilters] = useState([]);
    const [ediOpen, onEditOpen] = useState(false);
    const loadInventory = async () => {
        clearNotifications();
        const {
            inventoryConnector,
            mergeWithEntities,
            INVENTORY_ACTION_TYPES
        } = await asyncInventoryLoader();
        getRegistry().register({
            ...mergeWithEntities(entitiesReducer(INVENTORY_ACTION_TYPES))
        });

        const { InventoryTable } = inventoryConnector();
        setInventory(() => InventoryTable);
    };

    const onRefresh = (options) => {
        onSetfilters(options.filters);
        if (inventory && inventory.current) {
            inventory.current.onRefreshData(options);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const calculateSelected = () => selected ? selected.size : 0;

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
                                    ref={inventory}
                                    hasCheckbox
                                    onRefresh={onRefresh}
                                    {
                                    ...loaded && rows && rows.length > 0 && {
                                        actions: [
                                            {
                                                title: 'Delete',
                                                onClick: (_event, _index, { id: systemId, display_name: displayName }) => {
                                                    handleModalToggle(true);
                                                    activateSystem({
                                                        id: systemId,
                                                        displayName
                                                    });
                                                }
                                            }, {
                                                title: 'Edit',
                                                onClick: (_event, _index, data) => {
                                                    onEditOpen(true),
                                                    activateSystem(data);
                                                }
                                            }
                                        ]
                                    }
                                    }
                                    actionsConfig={{
                                        actions: [{
                                            label: 'Delete',
                                            props: {
                                                isDisabled: calculateSelected() === 0,
                                                variant: 'danger',
                                                onClick: () => {
                                                    activateSystem(Array.from(selected.values()));
                                                    handleModalToggle(true);
                                                }
                                            }
                                        }]
                                    }}
                                    bulkSelect={{
                                        count: calculateSelected(),
                                        items: [{
                                            title: 'Select none (0)',
                                            onClick: () => {
                                                onSelectRows(-1, false);
                                            }
                                        },
                                        {
                                            ...loaded && rows && rows.length > 0 ? {
                                                title: `Select page (${ rows.length })`,
                                                onClick: () => {
                                                    onSelectRows(0, true);
                                                }
                                            } : {}
                                        }],
                                        checked: calculateChecked(rows, selected),
                                        onSelect: (value) => {
                                            onSelectRows(0, value);
                                        }
                                    }}
                                />
                        }
                    </GridItem>
                </Grid>
            </Main>
            <DeleteModal
                handleModalToggle={handleModalToggle}
                isModalOpen={isModalOpen}
                currentSytem={currentSytem}
                onConfirm={() => {
                    let displayName;
                    let removeSystems;
                    if (Array.isArray(currentSytem)) {
                        removeSystems = currentSytem.map(({ id }) => id);
                        displayName = currentSytem.length > 1 ?
                            `${currentSytem.length} systems` :
                            currentSytem[0].display_name;
                    } else {
                        displayName = currentSytem.displayName;
                        removeSystems = [currentSytem.id];
                    }

                    addNotification({
                        id: 'remove-initiated',
                        variant: 'warning',
                        title: 'Delete operation initiated',
                        description: `Removal of ${displayName} started.`,
                        dismissable: false
                    });
                    deleteEntity(removeSystems, displayName, () => onRefresh({ filters }));
                    handleModalToggle(false);
                }}
            />

            <TextInputModal
                title="Edit name"
                isOpen={ediOpen}
                value={currentSytem.display_name}
                onCancel={() => onEditOpen(false)}
                onSubmit={(value) => {
                    updateDisplayName(currentSytem.id, value, inventory.current.onRefreshData);
                    onEditOpen(false);
                }}
            />
        </React.Fragment>
    );
};

Inventory.contextTypes = {
    store: PropTypes.object
};

Inventory.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        selected: PropTypes.bool
    })),
    loaded: PropTypes.bool,
    loadEntity: PropTypes.func,
    clearNotifications: PropTypes.func,
    deleteEntity: PropTypes.func,
    addNotification: PropTypes.func,
    updateDisplayName: PropTypes.func,
    onSelectRows: PropTypes.func,
    selected: PropTypes.map
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
        addNotification: (payload) => dispatch(addNotification(payload)),
        updateDisplayName: (id, displayName, callback) => dispatch(
            reloadWrapper(actions.editDisplayName(id, displayName), callback)
        ),
        onSelectRows: (id, isSelected) => dispatch(actions.selectEntity(id, isSelected))
    };
}

export default routerParams(connect(({ entities }) => ({
    rows: entities && entities.rows,
    loaded: entities && entities.loaded,
    selected: entities && entities.selected
}), mapDispatchToProps)(Inventory));
