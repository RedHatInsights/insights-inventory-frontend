import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../store/actions';
import { addNotification as addNotificationAction } from '@redhat-cloud-services/frontend-components-notifications/redux';
import DeleteModal from '../../../Utilities/DeleteModal';
import { TextInputModal } from '../../SystemDetails/GeneralInfo';
import { generateFilter } from '../../../Utilities/constants';
import { InventoryTable as InventoryTableCmp } from '../../InventoryTable';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import AddSelectedHostsToGroupModal from '../../InventoryGroups/Modals/AddSelectedHostsToGroupModal';
import { useBulkSelectConfig } from '../../../Utilities/hooks/useBulkSelectConfig';
import RemoveHostsFromGroupModal from '../../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  NO_MODIFY_GROUPS_TOOLTIP_MESSAGE,
  NO_MODIFY_HOSTS_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
  REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP,
} from '../../../constants';
import {
  ActionButton,
  ActionDropdownItem,
} from '../../InventoryTable/ActionWithRBAC';
import uniq from 'lodash/uniq';
import useTableActions from './useTableActions';
import useGlobalFilter from '../../filters/useGlobalFilter';
import useOnRefresh from '../../filters/useOnRefresh';

const BulkDeleteButton = ({ selectedSystems, ...props }) => {
  const requiredPermissions = selectedSystems.map(({ groups }) =>
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(groups?.[0]?.id ?? null)
  );

  return (
    <ActionButton
      requiredPermissions={requiredPermissions}
      noAccessTooltip={NO_MODIFY_HOSTS_TOOLTIP_MESSAGE}
      checkAll
      ouiaId="bulk-delete-button"
      {...props}
    >
      Delete
    </ActionButton>
  );
};

BulkDeleteButton.propTypes = {
  selectedSystems: PropTypes.array,
};

const ConventionalSystemsTab = ({
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
  hostGroupFilter,
}) => {
  const chrome = useChrome();
  const inventory = useRef(null);
  const [isModalOpen, handleModalToggle] = useState(false);
  const [currentSystem, setCurrentSystem] = useState({});
  const [filters, onSetfilters] = useState(
    generateFilter(
      status,
      source,
      tagsFilter,
      filterbyName,
      operatingSystem,
      rhcdFilter,
      updateMethodFilter,
      hostGroupFilter,
      lastSeenFilter
    )
  );
  const [ediOpen, onEditOpen] = useState(false);
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const globalFilter = useGlobalFilter();
  const rows = useSelector(({ entities }) => entities?.rows, shallowEqual);
  const loaded = useSelector(({ entities }) => entities?.loaded);
  const selected = useSelector(({ entities }) => entities?.selected);
  const total = useSelector(({ entities }) => entities?.total);
  const dispatch = useDispatch();
  const bulkSelectConfig = useBulkSelectConfig(
    selected,
    globalFilter,
    total,
    rows,
    loaded
  );

  const onRefresh = useOnRefresh((options) => {
    onSetfilters(options?.filters);
  });

  useEffect(() => {
    chrome.updateDocumentTitle('Systems - Inventory');
    chrome.appAction('system-list');
    chrome.appObjectId();
    dispatch(actions.clearNotifications());

    if (perPage || page) {
      dispatch(
        actions.setPagination(
          Array.isArray(page) ? page[0] : page,
          Array.isArray(perPage) ? perPage[0] : perPage
        )
      );
    }

    return () => {
      dispatch(actions.clearEntitiesAction());
    };
  }, []);

  const calculateSelected = () => (selected ? selected.size : 0);

  const isBulkRemoveFromGroupsEnabled = () => {
    return (
      calculateSelected() > 0 &&
      Array.from(selected.values()).some(({ groups }) => groups.length > 0) &&
      uniq(
        // can remove from at maximum one group at a time
        Array.from(selected.values())
          .filter(({ groups }) => groups.length > 0)
          .map(({ groups }) => groups[0].name)
      ).length === 1
    );
  };

  const isBulkAddHostsToGroupsEnabled = () => {
    if (calculateSelected() > 0) {
      const selectedHosts = Array.from(selected.values());

      return selectedHosts.every(({ groups }) => groups.length === 0);
    }

    return false;
  };

  const tableActions = useTableActions(
    setCurrentSystem,
    onEditOpen,
    handleModalToggle,
    setRemoveHostsFromGroupModalOpen,
    setAddHostGroupModalOpen
  );

  return (
    <Fragment>
      <InventoryTableCmp
        hasAccess={hasAccess}
        isRbacEnabled
        customFilters={{ filters, globalFilter }}
        isFullView
        showTags
        onRefresh={onRefresh}
        hasCheckbox
        autoRefresh
        ignoreRefresh
        initialLoading={initialLoading}
        ref={inventory}
        tableProps={{
          actionResolver: tableActions,
          canSelectAll: false,
        }}
        actionsConfig={{
          actions: [
            <BulkDeleteButton
              key="bulk-systems-delete"
              selectedSystems={Array.from(selected?.values?.() || [])}
              onClick={() => {
                setCurrentSystem(Array.from(selected.values()));
                handleModalToggle(true);
              }}
              variant="secondary"
              isAriaDisabled={calculateSelected() === 0}
            />,

            {
              label: (
                <ActionDropdownItem
                  key="bulk-add-to-group"
                  requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
                  isAriaDisabled={!isBulkAddHostsToGroupsEnabled()}
                  noAccessTooltip={NO_MODIFY_GROUPS_TOOLTIP_MESSAGE}
                  onClick={() => {
                    setCurrentSystem(Array.from(selected.values()));
                    setAddHostGroupModalOpen(true);
                  }}
                  ignoreResourceDefinitions
                >
                  Add to group
                </ActionDropdownItem>
              ),
            },
            {
              label: (
                <ActionDropdownItem
                  key="bulk-remove-from-group"
                  requiredPermissions={
                    selected !== undefined
                      ? Array.from(selected.values())
                          .flatMap(({ groups }) =>
                            groups?.[0]?.id !== undefined
                              ? REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                                  groups[0].id
                                )
                              : null
                          )
                          .filter(Boolean) // don't check ungroupped hosts
                      : []
                  }
                  isAriaDisabled={!isBulkRemoveFromGroupsEnabled()}
                  noAccessTooltip={NO_MODIFY_GROUPS_TOOLTIP_MESSAGE}
                  onClick={() => {
                    setCurrentSystem(Array.from(selected.values()));
                    setRemoveHostsFromGroupModalOpen(true);
                  }}
                  {...(selected === undefined // when nothing is selected, no access must be checked
                    ? { override: true }
                    : {})}
                  checkAll
                >
                  Remove from group
                </ActionDropdownItem>
              ),
            },
          ],
        }}
        bulkSelect={bulkSelectConfig}
        showCentosVersions
        showNoGroupOption
      />

      <DeleteModal
        className="sentry-mask data-hj-suppress"
        handleModalToggle={handleModalToggle}
        isModalOpen={isModalOpen}
        currentSytems={currentSystem}
        onConfirm={() => {
          let displayName;
          let removeSystems;
          if (Array.isArray(currentSystem)) {
            removeSystems = currentSystem.map(({ id }) => id);
            displayName =
              currentSystem.length > 1
                ? `${currentSystem.length} systems`
                : currentSystem[0].display_name;
          } else {
            displayName = currentSystem.display_name;
            removeSystems = [currentSystem.id];
          }

          dispatch(
            addNotificationAction({
              id: 'remove-initiated',
              variant: 'warning',
              title: 'Delete operation initiated',
              description: `Removal of ${displayName} started.`,
              dismissable: false,
            })
          );
          dispatch(actions.deleteEntity(removeSystems, displayName));
          handleModalToggle(false);
        }}
      />
      <TextInputModal
        title="Edit display name"
        isOpen={ediOpen}
        value={currentSystem.display_name}
        onCancel={() => onEditOpen(false)}
        onSubmit={(value) => {
          dispatch(actions.editDisplayName(currentSystem.id, value));
          onEditOpen(false);
        }}
      />
      {addHostGroupModalOpen && (
        <AddSelectedHostsToGroupModal
          isModalOpen={addHostGroupModalOpen}
          setIsModalOpen={setAddHostGroupModalOpen}
          modalState={currentSystem}
          reloadData={() => {
            if (calculateSelected() > 0) {
              dispatch(actions.selectEntity(-1, false));
            }

            setTimeout(
              () => inventory.current.onRefreshData(filters, false, true),
              500
            );
          }}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={currentSystem}
          reloadData={() => {
            if (calculateSelected() > 0) {
              dispatch(actions.selectEntity(-1, false));
            }

            setTimeout(
              () => inventory.current.onRefreshData(filters, false, true),
              500
            );
          }}
        />
      )}
    </Fragment>
  );
};

ConventionalSystemsTab.propTypes = {
  status: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  source: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  operatingSystem: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  filterbyName: PropTypes.arrayOf(PropTypes.string),
  tagsFilter: PropTypes.any,
  page: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  perPage: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  initialLoading: PropTypes.bool,
  rhcdFilter: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  updateMethodFilter: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  hasAccess: PropTypes.bool,
  hostGroupFilter: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  lastSeenFilter: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

ConventionalSystemsTab.defaultProps = {
  initialLoading: true,
};

export default ConventionalSystemsTab;
