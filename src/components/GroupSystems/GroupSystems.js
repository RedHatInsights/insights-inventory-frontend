import { fitContent } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React from 'react';
import InventoryTable from '../InventoryTable/InventoryTable';

const prepareColumns = (initialColumns) => {
    // hides the "groups" and additionally inserts the "update methods" columns
    const columns = initialColumns.filter(({ key }) => key !== 'groups');

    columns.splice(columns.length - 1 /* must be penultimate */, 0, {
        key: 'update_method',
        title: 'Update methods',
        sortKey: 'update_method',
        transforms: [fitContent],
        renderFunc: (value, hostId, systemData) =>
            systemData?.system_profile?.system_update_method || 'N/A'
    });

    return columns;
};

const GroupSystems = ({ groupName }) => {
    return <InventoryTable
        columns={prepareColumns}
        getEntities={async (items, config, showTags, defaultGetEntities) =>
            await defaultGetEntities(
                items,
                // filter systems by the group name
                { ...config, filters: { ...config.filters, groupName: [groupName] } },
                showTags
            )
        }
    />;
};

GroupSystems.propTypes = {
    groupName: PropTypes.string.isRequired
};

export default GroupSystems;
