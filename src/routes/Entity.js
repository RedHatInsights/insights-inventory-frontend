import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Main } from '@red-hat-insights/insights-frontend-components';
import { Button } from '@patternfly/react-core';
import EntityDetails from '../components/inventory/EntityDetails';

import * as actions from '../actions';

const InventoryEntityDetails = connect(({ entityDetails }) => ({ ...entityDetails }))(EntityDetails);

class Entity extends Component {

    constructor (props, ctx) {
        super(props, ctx);
        this.id = props.match.params.id;
        this.store = ctx.store;
    }

    componentDidMount () {
        this.store.dispatch(actions.loadEntity(parseInt(this.id)));
    }

    render() {
        return (
            <Main>
                <InventoryEntityDetails/>
                <Link to='/'>
                    <Button variant='primary'>Back</Button>
                </Link>
            </Main>
        );
    }
}

Entity.contextTypes = {
    store: PropTypes.object
};

Entity.propTypes = {
    match: PropTypes.object.isRequired
};

export default withRouter(Entity);
