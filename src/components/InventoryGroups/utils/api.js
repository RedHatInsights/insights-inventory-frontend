import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';
import { INVENTORY_API_BASE } from '../../../api';
import { TABLE_DEFAULT_PAGINATION } from '../../../constants';
import PropTypes from 'prop-types';

export const getGroups = (search = {}, pagination = { page: 1, perPage: TABLE_DEFAULT_PAGINATION }) => {
    const parameters = new URLSearchParams({
        ...search,
        ...pagination
    }).toString();

    return instance.get(`${INVENTORY_API_BASE}/groups?${parameters}` /* , { headers: { Prefer: 'code=404' } } */);
};

getGroups.propTypes = {
    search: PropTypes.shape({
    // eslint-disable-next-line camelcase
        hostname_or_id: PropTypes.string
    }),
    pagination: PropTypes.shape({
        perPage: PropTypes.number,
        page: PropTypes.number
    })
};
