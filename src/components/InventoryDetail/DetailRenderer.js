import React from 'react';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import DetailWrapper from './DetailWrapper';
import AccessDenied from '../../Utilities/AccessDenied';

const DetailRenderer = ({ isRbacEnabled, ...props }) => {
    const { hasAccess } = usePermissionsWithContext([
        'inventory:*:*',
        'inventory:*:read',
        'inventory:hosts:read'
    ]);

    if (isRbacEnabled && hasAccess === false) {
        return <AccessDenied />;
    } else {
        return <DetailWrapper {...props} />;
    }
};

DetailRenderer.propTypes = {
    isRbacEnabled: PropTypes.bool
};

export default DetailRenderer;
