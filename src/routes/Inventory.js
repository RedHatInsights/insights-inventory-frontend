import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import './inventory.scss';

import { PageHeader, PageHeaderTitle, Main } from '@red-hat-insights/insights-frontend-components';
import { Button } from '@patternfly/react-core';

import * as actions from '../actions';
import EntityTable from '../components/inventory/EntityTable';

const InventoryEntityTable = connect(({ entities }) => ({ ...entities }))(EntityTable);

class Inventory extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.loadEntities = () => ctx.store.dispatch(actions.loadEntities());
        this.alert1 = () => ctx.store.dispatch(actions.addAlert({ title: 'Dismissible alert', dismissible: true }));
        this.alert2 = () => ctx.store.dispatch(actions.addAlert({ title: 'Non-dismissible alert', dismissible: false }));
    }

    componentDidMount () {
        this.loadEntities();
    }

    render() {
        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Inventory'/>
                </PageHeader>
                <Main>
                    <InventoryEntityTable/>
                    <div className='buttons'>
                        <Button variant='primary' onClick={this.loadEntities}>Refresh</Button>
                        <Button variant='secondary' onClick={this.alert1}>Dismissible alert</Button>
                        <Button variant='secondary' onClick={this.alert2}>Non-dismissible alert</Button>
                    </div>
                </Main>
            </React.Fragment>
        );
    }
}

Inventory.contextTypes = {
    store: PropTypes.object
};

export default withRouter(Inventory);
