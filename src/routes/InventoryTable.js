import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './inventory.scss';
import { PageHeader, PageHeaderTitle, Main, routerParams, DownloadButton } from '@red-hat-insights/insights-frontend-components';
import { entitiesReducer } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { registry as registryDecorator } from '@red-hat-insights/insights-frontend-components';
import { getAllEntities } from '../api';
import { downloadFile, JSON_TYPE } from '@red-hat-insights/insights-frontend-components/Utilities/helpers';

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
        this.onSelect = this.onSelect.bind(this);
    }

    async loadInventory() {
        const {
            inventoryConnector,
            mergeWithEntities
        } = await asyncInventoryLoader();
        this.getRegistry().register({
            ...mergeWithEntities(entitiesReducer)
        });

        // No need for it right now because we are not getting extra data
        // const removeListener = addNewListener({
        //     actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITIES,
        //     callback: ({ data }) => {
        //         // eslint-disable-next-line camelcase
        //         data.then(({ page, per_page }) => {
        //             // eslint-disable-next-line camelcase
        //             this.props.loadEntities({ page, per_page, filters: this.state.filters });
        //         });
        //     }
        // });

        const { InventoryTable, updateEntities } = inventoryConnector();

        this.updateEntities = updateEntities;

        this.setState({
            ConnectedInventory: InventoryTable
        });
    }

    onRefresh({ filters }) {
        this.setState({
            filters
        });
    }

    async onSelect(_event, fileType) {
        const { filters } = this.state;
        const results = await getAllEntities({ filters });
        if (fileType === 'json') {
            downloadFile(JSON.stringify(results), `${new Date().toISOString()}.json`, JSON_TYPE);
        } else {
            const header = Object.keys(results[0]);
            const data = results.map(item => header.map(head => item[head] || '').join(','));
            downloadFile([
                header.join(','),
                ...data
            ].join('\n'), `${new Date().toISOString()}.csv`, JSON_TYPE);
        }
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
                                >
                                    { DownloadButton && <DownloadButton onSelect={this.onSelect}/> }
                                </ConnectedInventory>
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
