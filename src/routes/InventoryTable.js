import React, { useEffect, useState, useRef } from 'react';
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
    Dropdown,
    DropdownItem,
    KebabToggle
} from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';
import DeleteModal from '../components/DeleteModal';

const Inventory = ({ clearNotifications, deleteEntity, addNotification, rows }) => {
    const inventory = useRef(null);
    const [ConnectedInventory, setInventory] = useState();
    const [isModalOpen, handleModalToggle] = useState(false);
    const [currentSytem, activateSystem] = useState({});
    const [filters, onSetfilters] = useState([]);
    const [dropdownOpened, onDropdownToggle] = useState(false);
    const loadInventory = async () => {
        clearNotifications();
        const {
            inventoryConnector,
            mergeWithEntities
        } = await asyncInventoryLoader();
        getRegistry().register({
            ...mergeWithEntities(entitiesReducer)
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
                                    actions={[
                                        {
                                            title: 'Delete',
                                            onClick: (_event, _index, { id: systemId, display_name: displayName }) => {
                                                handleModalToggle(true);
                                                activateSystem({
                                                    id: systemId,
                                                    displayName
                                                });
                                            }
                                        }
                                    ]}
                                >
                                    <Dropdown
                                        isPlain
                                        onSelect={() => onDropdownToggle(!dropdownOpened)}
                                        isOpen={dropdownOpened}
                                        toggle={<KebabToggle onToggle={(isOpen) => onDropdownToggle(isOpen)}/>}
                                        dropdownItems={[
                                            <DropdownItem
                                                key={'delete-selected'}
                                                onClick={() => {
                                                    const selectedSystems = rows.filter(row => row.selected);
                                                    if (selectedSystems.length > 0) {
                                                        activateSystem(selectedSystems);
                                                        handleModalToggle(true);
                                                    }
                                                }}
                                                component='button'
                                            >
                                                Delete
                                            </DropdownItem>
                                        ]}
                                    />
                                </ConnectedInventory>
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

export default routerParams(connect(({ entities }) => ({
    rows: entities && entities.rows,
    loaded: entities && entities.loaded
}), mapDispatchToProps)(Inventory));
