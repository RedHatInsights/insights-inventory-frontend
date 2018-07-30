import React from 'react';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import Breadcrumbs from '../Breadcrumbs';

import './EntityDetails.scss';

const TYPE_PLACEHOLDER = 'RHEL Box';

// MARK: maybe implement this in components??
const EntityDetails = ({ loaded, entity }) => {
    if (!loaded) {
        return (
            <div>
                <SyncAltIcon/>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Breadcrumbs name='Inventory' path='/inventory' param={entity.display_name}/>
            <Title size='2xl'>{entity.display_name}</Title>
            <dl>
                <dt>hostname</dt>
                <dd>{entity.display_name}</dd>
                <dt>system id</dt>
                <dd>{entity.id}</dd>
                <dt>type</dt>
                <dd>{TYPE_PLACEHOLDER}</dd>
                <dt>account</dt>
                <dd>{entity.account}</dd>
            </dl>
        </React.Fragment>
    );
};

EntityDetails.propTypes = {
    loaded: PropTypes.bool.isRequired,
    entity: PropTypes.object
};

export default EntityDetails;
