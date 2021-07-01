/* eslint-disable camelcase */
import React, { useEffect, useState, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector, useStore } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './inventory.scss';
import { PageHeader, PageHeaderTitle, Main } from '@redhat-cloud-services/frontend-components';
import { tableReducer, RegistryContext } from '../store';
import * as actions from '../store/actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/redux';
import DeleteModal from '../Utilities/DeleteModal';
import { TextInputModal } from '../components/SystemDetails/GeneralInfo';
import flatMap from 'lodash/flatMap';
import { defaultFilters, generateFilter } from '../Utilities/constants';

import InventoryTable from '../modules/InventoryTable';

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
    registeredWithFilter: ({ registeredWithFilter }, searchParams) => registeredWithFilter
    ?.forEach(item => searchParams.append('source', item)),
    value: ({ value, filter }, searchParams) => value === 'hostname_or_id' &&
    Boolean(filter) &&
    searchParams.append('hostname_or_id', filter),
    tagFilters: ({ tagFilters }, searchParams) => tagFilters?.length > 0 && searchParams.append(
        'tags',
        flatMap(tagFilters, mapTags)
    )
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
    page,
    perPage,
    initialLoading
}) => {
    document.title = 'Inventory | Red Hat Insights';
    const history = useHistory();
    const store = useStore();
    const { getRegistry } = useContext(RegistryContext);
    const inventory = useRef(null);
    const [isModalOpen, handleModalToggle] = useState(false);
    const [currentSytem, activateSystem] = useState({});
    const [filters, onSetfilters] = useState([]);
    const [ediOpen, onEditOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState();
    const { loading, writePermissions } = useSelector(
        ({ permissionsReducer }) =>
            ({ loading: permissionsReducer?.loading, writePermissions: permissionsReducer?.writePermissions }),
        shallowEqual
    );

    const rows = useSelector(({ entities }) => entities?.rows, shallowEqual);
    const loaded = useSelector(({ entities }) => entities?.loaded);
    const selected = useSelector(({ entities }) => entities?.selected);
    const dispatch = useDispatch();

    const clearNotifications = () => dispatch(actions.clearNotifications());
    const deleteEntity = (id, hostName, callback) => dispatch(reloadWrapper(actions.deleteEntity(id, hostName), callback));
    const addNotification = (payload) => dispatch(addNotificationAction(payload));
    const updateDisplayName = (id, displayName, callback) => dispatch(
        reloadWrapper(actions.editDisplayName(id, displayName), callback)
    );
    const onSelectRows = (id, isSelected) => dispatch(actions.selectEntity(id, isSelected));
    const setFilter = (filtersList) => filtersList?.length > 0 && dispatch(actions.setFilter(filtersList));
    const setPagination = (page, perPage) => dispatch(actions.setPagination(page, perPage));

    const onRefresh = (options, callback) => {
        if (!options?.filters) {
            options.filters = Object.entries(defaultFilters).map(([key, val]) => ({ [key]: val }));
        }

        const { status, source, tagsFilter, filterbyName } = (options?.filters || []).reduce((acc, curr) => ({
            ...acc,
            ...curr?.staleFilter && { status: curr.staleFilter },
            ...curr?.registeredWithFilter && { source: curr.registeredWithFilter },
            ...curr?.tagFilters && { tagsFilter: curr.tagFilters },
            ...curr?.value === 'hostname_or_id' && { filterbyName: curr.filter }
        }), { status: undefined, source: undefined, tagsFilter: undefined, filterbyName: undefined });
        options.filters = generateFilter(status, source, tagsFilter, filterbyName);

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

        if (!callback && inventory?.current) {
            inventory.current.onRefreshData(options);
        } else if (callback) {
            callback(options);
        }
    };

    useEffect(() => {
        insights.chrome?.hideGlobalFilter?.(false);
        insights.chrome.appAction('system-list');
        insights.chrome.appObjectId();
        insights.chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
            const [workloads, SID, tags] = insights.chrome?.mapGlobalFilter?.(data, false, true);
            setGlobalFilter({
                tags,
                filter: {
                    ...globalFilter?.filter,
                    system_profile: {
                        ...globalFilter?.filter?.system_profile,
                        ...workloads?.SAP?.isSelected && { sap_system: true },
                        ...SID?.length > 0 && { sap_sids: SID }
                    }
                }
            });
        });
        clearNotifications();
    }, []);

    const calculateSelected = () => selected ? selected.size : 0;

    return (
        <React.Fragment>
            <PageHeader className="pf-m-light">
                <PageHeaderTitle title='Inventory'/>
            </PageHeader>
            <Main>
                <Grid gutter="md">
                    <GridItem span={12}>
                        {
                            !loading && <InventoryTable
                                history={history}
                                store={store}
                                customFilters={globalFilter}
                                isFullView
                                ref={inventory}
                                showTags
                                onRefresh={onRefresh}
                                hasCheckbox={writePermissions}
                                autoRefresh
                                initialLoading={initialLoading}
                                {...(writePermissions && {
                                    actions: [
                                        {
                                            title: 'Delete',
                                            onClick: (_event, _index, { id: systemId, display_name: displayName }) => {
                                                activateSystem(() => ({
                                                    id: systemId,
                                                    displayName
                                                }));
                                                handleModalToggle(() => true);
                                            }
                                        }, {
                                            title: 'Edit',
                                            onClick: (_event, _index, data) => {
                                                activateSystem(() => data);
                                                onEditOpen(() => true);
                                            }
                                        }
                                    ],
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
                                tableProps={{
                                    canSelectAll: false
                                }}
                                onRowClick={(_e, id, app) => history.push(`/${id}${app ? `/${app}` : ''}`)}
                                onLoad={({ mergeWithEntities, INVENTORY_ACTION_TYPES }) => {
                                    getRegistry().register({
                                        ...mergeWithEntities(tableReducer(INVENTORY_ACTION_TYPES))
                                    });

                                    setFilter(generateFilter(status, source, tagsFilter, filterbyName));

                                    if (perPage || page) {
                                        setPagination(
                                            Array.isArray(page) ? page[0] : page,
                                            Array.isArray(perPage) ? perPage[0] : perPage
                                        );
                                    }
                                }}
                            />
                        }
                    </GridItem>
                </Grid>
            </Main>
            <DeleteModal
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

                    addNotification({
                        id: 'remove-initiated',
                        variant: 'warning',
                        title: 'Delete operation initiated',
                        description: `Removal of ${displayName} started.`,
                        dismissable: false
                    });
                    deleteEntity(removeSystems, displayName, () => onRefresh({ filters }));
                    handleModalToggle(false);
                }}
            />

            <TextInputModal
                title="Edit display name"
                isOpen={ediOpen}
                value={currentSytem.display_name}
                onCancel={() => onEditOpen(false)}
                onSubmit={(value) => {
                    updateDisplayName(currentSytem.id, value, inventory.current.onRefreshData);
                    onEditOpen(false);
                }}
            />
        </React.Fragment>
    );
};

Inventory.propTypes = {
    status: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    source: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    filterbyName: PropTypes.string,
    tagsFilter: PropTypes.any,
    page: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    perPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initialLoading: PropTypes.bool
};

Inventory.defaultProps = {
    initialLoading: true
};

export default Inventory;
