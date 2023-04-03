/* eslint-disable camelcase */
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './inventory.scss';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';
import * as actions from '../store/actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/redux';
import DeleteModal from '../Utilities/DeleteModal';
import { TextInputModal } from '../components/SystemDetails/GeneralInfo';
import flatMap from 'lodash/flatMap';
import { useWritePermissions, RHCD_FILTER_KEY, UPDATE_METHOD_KEY, generateFilter } from '../Utilities/constants';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import AddHostToGroupModal from '../components/InventoryGroups/Modals/AddHostToGroupModal';
import useFeatureFlag from '../Utilities/useFeatureFlag';

const reloadWrapper = (event, callback) => {
    event.payload.then(callback);
    return event;
};

const calculateChecked = (rows = [], selected) => (
    rows.every(({ id }) => selected && selected.has(id))
        ? rows.length > 0
        : rows.some(({ id }) => selected && selected.has(id)) && null
);

const mapTags = ({ category, values }) => values.map(({ tagKey, value }) => `${
    category ? `${category}/` : ''
}${
    tagKey
}${
    value ? `=${value}` : ''
}`);

const filterMapper = {
    staleFilter: ({ staleFilter }, searchParams) => staleFilter.forEach(item => searchParams.append('status', item)),
    osFilter: ({ osFilter }, searchParams) => osFilter
    ?.forEach(item => searchParams.append('operating_system', item)),
    registeredWithFilter: ({ registeredWithFilter }, searchParams) => registeredWithFilter
    ?.forEach(item => searchParams.append('source', item)),
    value: ({ value, filter }, searchParams) => value === 'hostname_or_id' &&
    Boolean(filter) &&
    searchParams.append('hostname_or_id', filter),
    tagFilters: ({ tagFilters }, searchParams) => tagFilters?.length > 0 && searchParams.append(
        'tags',
        flatMap(tagFilters, mapTags)
    ),
    rhcdFilter: ({ rhcdFilter }, searchParams) => rhcdFilter?.forEach(item => searchParams.append(RHCD_FILTER_KEY, item)),
    lastSeenFilter: ({ lastSeenFilter }, searchParams) =>
        Object.keys(lastSeenFilter || {})?.forEach(item => item === 'mark' &&
        searchParams.append('last_seen', lastSeenFilter[item])),
    updateMethodFilter: ({ updateMethodFilter }, searchParams) =>
        updateMethodFilter?.forEach(item => searchParams.append(UPDATE_METHOD_KEY, item)),
    groupHostFilter: ({ groupHostFilter }, searchParams) => groupHostFilter
    ?.forEach(item => searchParams.append('host_group', item))
};

const calculateFilters = (searchParams, filters = []) => {
    filters.forEach((filter) => {
        Object.keys(filter).forEach(key => {
            filterMapper?.[key]?.(filter, searchParams);
        });
    });
    return searchParams;
};

export const calculatePagination = (searchParams, page, perPage) => {
    const currSearch = new URLSearchParams(location.search);
    const newPage = page !== undefined ? page : currSearch.get('page');
    const newPerPage = perPage !== undefined ? perPage : currSearch.get('per_page');
    !isNaN(parseInt(newPage)) && searchParams.append('page', newPage);
    !isNaN(parseInt(newPerPage)) && searchParams.append('per_page', newPerPage);
};

const Inventory = ({
    status,
    source,
    filterbyName,
    tagsFilter,
    operatingSystem,
    rhcdFilter,
    updateMethodFilter,
    lastSeenFilter,
    page,
    perPage,
    initialLoading,
    hasAccess,
    groupHostsFilter
}) => {
    const history = useHistory();
    const chrome = useChrome();
    const inventory = useRef(null);
    const [isModalOpen, handleModalToggle] = useState(false);
    const [currentSytem, activateSystem] = useState({});
    const [filters, onSetfilters] = useState(
        generateFilter(
            status,
            source,
            tagsFilter,
            filterbyName,
            operatingSystem,
            rhcdFilter,
            updateMethodFilter,
            groupHostsFilter,
            lastSeenFilter)
    );
    const [ediOpen, onEditOpen] = useState(false);
    const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState();
    const writePermissions = useWritePermissions();
    const rows = useSelector(({ entities }) => entities?.rows, shallowEqual);
    const loaded = useSelector(({ entities }) => entities?.loaded);
    const selected = useSelector(({ entities }) => entities?.selected);
    const dispatch = useDispatch();
    const groupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');

    const onSelectRows = (id, isSelected) => dispatch(actions.selectEntity(id, isSelected));
    const onRefresh = (options, callback) => {
        onSetfilters(options?.filters);
        const searchParams = new URLSearchParams();
        calculateFilters(searchParams, options?.filters);
        // eslint-disable-next-line camelcase
        calculatePagination(searchParams, options?.page, options?.per_page);
        const search = searchParams.toString();
        history.push({
            search,
            hash: location.hash
        });

        if (callback) {
            callback(options);
        }
    };

    useEffect(() => {
        chrome.updateDocumentTitle('Inventory | Red Hat Insights');
        chrome?.hideGlobalFilter?.(false);
        chrome.appAction('system-list');
        chrome.appObjectId();
        chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
            const [workloads, SID, tags] = chrome?.mapGlobalFilter?.(data, false, true);
            setGlobalFilter({
                tags,
                filter: {
                    ...globalFilter?.filter,
                    system_profile: {
                        ...globalFilter?.filter?.system_profile,
                        ...workloads?.SAP?.isSelected && { sap_system: true },
                        ...workloads && workloads['Ansible Automation Platform']?.isSelected
                            && { ansible: 'not_nil' },
                        ...workloads?.['Microsoft SQL']?.isSelected
                            && { mssql: 'not_nil' },
                        ...SID?.length > 0 && { sap_sids: SID }
                    }
                }
            });
        });
        dispatch(actions.clearNotifications());

        if (perPage || page) {
            dispatch(actions.setPagination(
                Array.isArray(page) ? page[0] : page,
                Array.isArray(perPage) ? perPage[0] : perPage
            ));
        }

        return () => {
            dispatch(actions.clearEntitiesAction());
        };
    }, []);

    const calculateSelected = () => selected ? selected.size : 0;

    //This wrapping of table actions allows to pass feature flag status and receive a prepared array of actions
    const tableActions = (groupsUiStatus, row) => {
        const isGroupPresentForThisRow = (row) => {
            return row && row?.groups?.title !== '';
        };

        const standardActions = [
            {
                title: 'Edit',
                onClick: (_event, _index, data) => {
                    activateSystem(() => data);
                    onEditOpen(() => true);
                }
            },
            {
                title: 'Delete',
                onClick: (_event, _index, { id: systemId, display_name: displayName }) => {
                    activateSystem(() => ({
                        id: systemId,
                        displayName
                    }));
                    handleModalToggle(() => true);
                }
            }
        ];

        const actionsBehindFeatureFlag = [
            {
                title: 'Add to group',
                onClick: (_event, _index, { id: systemId, display_name: displayName, group_name: groupName }) => {
                    activateSystem(() => ({
                        id: systemId,
                        name: displayName,
                        groupName
                    }));
                    setAddHostGroupModalOpen(true);
                }
            },
            {
                title: 'Remove from group',
                isDisabled: isGroupPresentForThisRow(row)
            }
        ];

        return [...(groupsUiStatus ? actionsBehindFeatureFlag : []), ...standardActions];
    };

    return (
        <React.Fragment>
            <PageHeader className="pf-m-light">
                <PageHeaderTitle title='Inventory'/>
            </PageHeader>
            <Main>
                <Grid gutter="md">
                    <GridItem span={12}>
                        <InventoryTableCmp
                            hasAccess={hasAccess}
                            isRbacEnabled
                            customFilters={{ filters, globalFilter }}
                            isFullView
                            inventoryRef={inventory}
                            showTags
                            onRefresh={onRefresh}
                            hasCheckbox={writePermissions}
                            autoRefresh
                            ignoreRefresh
                            initialLoading={initialLoading}
                            tableProps={
                                (writePermissions && {
                                    actionResolver: (row) => tableActions(groupsEnabled, row), canSelectAll: false })}
                            {...(writePermissions && {
                                actionsConfig: {
                                    actions: [{
                                        label: 'Delete',
                                        props: {
                                            isDisabled: calculateSelected() === 0,
                                            variant: 'secondary',
                                            onClick: () => {
                                                activateSystem(Array.from(selected.values()));
                                                handleModalToggle(true);
                                            }
                                        }
                                    }]
                                },
                                bulkSelect: {
                                    count: calculateSelected(),
                                    id: 'bulk-select-systems',
                                    items: [{
                                        title: 'Select none (0)',
                                        onClick: () => {
                                            onSelectRows(-1, false);
                                        }
                                    },
                                    {
                                        ...loaded && rows && rows.length > 0 ? {
                                            title: `Select page (${ rows.length })`,
                                            onClick: () => {
                                                onSelectRows(0, true);
                                            }
                                        } : {}
                                    }],
                                    checked: calculateChecked(rows, selected),
                                    onSelect: (value) => {
                                        onSelectRows(0, value);
                                    }
                                }
                            })}
                            onRowClick={(_e, id, app) => history.push(`/${id}${app ? `/${app}` : ''}`)}
                        />
                    </GridItem>
                </Grid>
            </Main>
            <DeleteModal
                className ='sentry-mask data-hj-suppress'
                handleModalToggle={handleModalToggle}
                isModalOpen={isModalOpen}
                currentSytems={currentSytem}
                onConfirm={() => {
                    let displayName;
                    let removeSystems;
                    if (Array.isArray(currentSytem)) {
                        removeSystems = currentSytem.map(({ id }) => id);
                        displayName = currentSytem.length > 1 ?
                            `${currentSytem.length} systems` :
                            currentSytem[0].display_name;
                    } else {
                        displayName = currentSytem.displayName;
                        removeSystems = [currentSytem.id];
                    }

                    dispatch(addNotificationAction({
                        id: 'remove-initiated',
                        variant: 'warning',
                        title: 'Delete operation initiated',
                        description: `Removal of ${displayName} started.`,
                        dismissable: false
                    }));
                    dispatch(reloadWrapper(actions.deleteEntity(removeSystems, displayName), () => onRefresh({ filters })));
                    handleModalToggle(false);
                }}
            />
            <TextInputModal
                title="Edit display name"
                isOpen={ediOpen}
                value={currentSytem.display_name}
                onCancel={() => onEditOpen(false)}
                onSubmit={(value) => {
                    dispatch(actions.editDisplayName(currentSytem.id, value));
                    onEditOpen(false);
                }}
            />
            <AddHostToGroupModal
                isModalOpen={addHostGroupModalOpen}
                setIsModalOpen={setAddHostGroupModalOpen}
                modalState={currentSytem}
                //should be replaced with a fetch to update the values in the table
                reloadData={() => console.log('data reloaded')}
            />
        </React.Fragment>
    );
};

Inventory.propTypes = {
    status: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    source: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    operatingSystem: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    filterbyName: PropTypes.arrayOf(PropTypes.string),
    tagsFilter: PropTypes.any,
    page: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    perPage: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    initialLoading: PropTypes.bool,
    rhcdFilter: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    updateMethodFilter: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    hasAccess: PropTypes.bool,
    groupHostsFilter: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    lastSeenFilter: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string])
};

Inventory.defaultProps = {
    initialLoading: true
};

export default Inventory;
