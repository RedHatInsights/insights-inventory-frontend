import { fitContent, TableVariant } from '@patternfly/react-table';
import difference from 'lodash/difference';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEntity } from '../../store/inventory-actions';
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
    const dispatch = useDispatch();

    const selected = useSelector(
        (state) => state?.entities?.selected || new Map()
    );
    const rows = useSelector(({ entities }) => entities?.rows || []);

    const noneSelected = selected.size === 0;
    const displayedIds = map(rows, 'id');
    const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

    return (
        <div id='group-systems-table'>
            <InventoryTable
                columns={prepareColumns}
                getEntities={async (items, config, showTags, defaultGetEntities) =>
                    await defaultGetEntities(
                        items,
                        // filter systems by the group name
                        {
                            ...config,
                            filters: {
                                ...config.filters,
                                groupName: [groupName] // TODO: the param is not yet supported by `apiHostGetHostList`
                            }
                        },
                        showTags
                    )
                }
                tableProps={{
                    isStickyHeader: true,
                    variant: TableVariant.compact,
                    canSelectAll: false
                }}
                bulkSelect={{
                    count: selected.size,
                    id: 'bulk-select-groups',
                    items: [
                        {
                            title: 'Select none (0)',
                            onClick: () => dispatch(selectEntity(-1, false)),
                            props: { isDisabled: noneSelected }
                        },
                        {
                            title: `${pageSelected ? 'Deselect' : 'Select'} page (${
                                rows.length
                            } items)`,
                            onClick: () => dispatch(selectEntity(0, !pageSelected))
                        }
                    // TODO: Implement "select all"
                    ],
                    onSelect: (value) => {
                        dispatch(selectEntity(0, value));
                    },
                    checked: selected.size > 0 // TODO: support partial selection (dash sign) in FEC BulkSelect
                }}
            />
        </div>
    );
};

GroupSystems.propTypes = {
    groupName: PropTypes.string.isRequired
};

export default GroupSystems;
