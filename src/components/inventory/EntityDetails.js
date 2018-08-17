import React from 'react';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import get from 'lodash/get';

import Breadcrumbs from '../Breadcrumbs';

import './EntityDetails.scss';

// MARK: maybe implement this in components??
const EntityDetails = ({ loaded, entity }) => {
    if (!loaded) {
        return (
            <div>
                <SyncAltIcon/>
            </div>
        );
    }

    const getFact = path => get(entity, path, 'unknown');

    return (
        <React.Fragment>
            <Breadcrumbs name='Inventory' path='/' param={entity.display_name}/>
            <Title size='2xl'>{entity.display_name}</Title>
            <dl>
                <dt>Hostname</dt>
                <dd>{getFact('display_name')}</dd>
                <dt>System ID</dt>
                <dd>{entity.id}</dd>
                <dt>Canonical System ID</dt>
                <dd>{getFact(`canonical_facts['machine-id']`)}</dd>
                <dt>System</dt>
                <dd>{getFact('facts.release')}</dd>
                <dt>Timezone</dt>
                <dd>{getFact('facts.timezone_information.timezone')}</dd>
            </dl>
        </React.Fragment>
    );
};

EntityDetails.propTypes = {
    loaded: PropTypes.bool.isRequired,
    entity: PropTypes.object
};

export default EntityDetails;
