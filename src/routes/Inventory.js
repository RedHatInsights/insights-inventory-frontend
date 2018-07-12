import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import './inventory.scss';

import { PageHeader, PageHeaderTitle, Section } from '@red-hat-insights/insights-frontend-components';
import { Button } from '@patternfly/react-core';

import * as actions from '../actions';
import EntityTable from '../components/inventory/EntityTable';

const InventoryEntityTable = connect(({ entities }) => ({ ...entities }))(EntityTable);

class Inventory extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.loadEntities = () => ctx.store.dispatch(actions.loadEntities());
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
                <Section type='content'>
                    <InventoryEntityTable/>
                    <Button variant='primary' onClick={() => this.loadEntities()}>Refresh</Button>
                </Section>
            </React.Fragment>
        );
    }
}

Inventory.contextTypes = {
    store: PropTypes.object
};

export default withRouter(Inventory);
