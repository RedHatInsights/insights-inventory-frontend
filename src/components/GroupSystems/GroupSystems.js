import { Button } from '@patternfly/react-core';
import { fitContent, TableVariant } from '@patternfly/react-table';
import difference from 'lodash/difference';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilters, selectEntity } from '../../store/inventory-actions';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { Link } from 'react-router-dom';

export const bulkSelectConfig = (dispatch, selectedNumber, noneSelected, pageSelected, rowsNumber) => ({
    count: selectedNumber,
    id: 'bulk-select-systems',
    items: [
        {
            title: 'Select none (0)',
            onClick: () => dispatch(selectEntity(-1, false)),
            props: { isDisabled: noneSelected }
        },
        {
            title: `${pageSelected ? 'Deselect' : 'Select'} page (${
                rowsNumber
            } items)`,
            onClick: () => dispatch(selectEntity(0, !pageSelected))
        }
        // TODO: Implement "select all"
    ],
    onSelect: (value) => {
        dispatch(selectEntity(0, value));
    },
    checked: selectedNumber > 0 && pageSelected // TODO: support partial selection (dash sign) in FEC BulkSelect
});

export const prepareColumns = (initialColumns, hideGroupColumn) => {
    // hides the "groups" column
    const columns = hideGroupColumn ? initialColumns.filter(({ key }) => key !== 'groups') : initialColumns;

    // additionally insert the "update method" column
    columns.splice(columns.length - 2 /* must be the 3rd col from the end */, 0, {
        key: 'update_method',
        title: 'Update method',
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

    columns[columns.findIndex(({ key }) => key === 'display_name')].renderFunc =
    (value, hostId) =>  (
        <div className="sentry-mask data-hj-suppress">
            <Link to={`/${hostId}`}>
                {value}
            </Link>
        </div>
    );

    // map columns to the speicifc order
    return [
        'display_name',
        'groups',
        'tags',
        'system_profile',
        'update_method',
        'updated'
    ].map((colKey) => columns.find(({ key }) => key === colKey))
    .filter(Boolean); // eliminate possible undefined's
};

const GroupSystems = ({ groupName, groupId }) => {
    const dispatch = useDispatch();

    const selected = useSelector(
        (state) => state?.entities?.selected || new Map()
    );
    const rows = useSelector(({ entities }) => entities?.rows || []);

    const noneSelected = selected.size === 0;
    const displayedIds = map(rows, 'id');
    const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

    const [isModalOpen, setIsModalOpen] = useState(false);

    const resetTable = () => {
        dispatch(clearFilters());
        dispatch(selectEntity(-1, false));
    };

    useEffect(() => {
        return () => {
            resetTable();
        };
    }, []);

    return (
        <div id='group-systems-table'>
            {
                isModalOpen && <AddSystemsToGroupModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={(value) => {
                        resetTable();
                        setIsModalOpen(value);
                    }
                    }
                    groupId={groupId}
                    groupName={groupName}
                />
            }
            {
                !isModalOpen &&
                <InventoryTable
                    columns={(columns) => prepareColumns(columns, true)}
                    hideFilters={{ hostGroupFilter: true }}
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
                    bulkSelect={bulkSelectConfig(dispatch, selected.size, noneSelected, pageSelected, rows.length)}
                    showTags
                >
                    <Button
                        variant='primary'
                        onClick={() => {
                            resetTable();
                            setIsModalOpen(true);
                        }}

                    >
                    Add systems
                    </Button>
                </InventoryTable>
            }
        </div>
    );
};

GroupSystems.propTypes = {
    groupName: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired
};

export default GroupSystems;
