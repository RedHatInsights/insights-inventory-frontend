import React from 'react';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core';
import { Icon } from '@patternfly/react-icons';
import Breadcrumbs from '../Breadcrumbs';

import './EntityDetails.scss';

const EntityDetails = ({ loaded, entity }) => {
    if (!loaded) {
        return (
            <div>
                <Icon name='sync-alt'/>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Breadcrumbs name='Inventory' path='/inventory' param={entity.display_name}/>
            <Title size='xxl'>{entity.display_name}</Title>
            <dl>
                <dt>hostname</dt>
                <dd>{entity.display_name}</dd>
                <dt>system id</dt>
                <dd>{entity.id}</dd>
                <dt>type</dt>
                <dd>RHEL Box</dd>
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
