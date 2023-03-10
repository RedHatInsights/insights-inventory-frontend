import { fitContent, TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React from 'react';
import InventoryTable from '../InventoryTable/InventoryTable';

const prepareColumns = (initialColumns) => {
    // hides the "groups" column
    const columns = initialColumns.filter(({ key }) => key !== 'groups');

    // additionally insert the "update methods" column
    columns.splice(columns.length - 1 /* must be penultimate */, 0, {
        key: 'update_method',
        title: 'Update methods',
        sortKey: 'update_method',
        transforms: [fitContent],
        renderFunc: (value, hostId, systemData) =>
            systemData?.system_profile?.system_update_method || 'N/A',
        props: {
            // TODO: remove isStatic when the sorting is supported by API
            isStatic: true,
            width: 10
        }
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
        tableProps={{
            isStickyHeader: true,
            variant: TableVariant.compact
        }}
    />;
};

GroupSystems.propTypes = {
    groupName: PropTypes.string.isRequired
};

export default GroupSystems;
