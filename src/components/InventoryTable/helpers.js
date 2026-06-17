import React from 'react';
import { cellWidth, expandable, sortable } from '@patternfly/react-table';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import TitleColumn from './TitleColumn';
import { Fragment } from 'react';
import { Skeleton } from '@patternfly/react-core';
import {
  MOVE_SYSTEM_MENU_TEXT,
  NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
} from '../../constants';

/**
 * Minimal host row shape for move-system disable checks. Callers pass only the permission slice
 * they need; full host objects from inventory/Systems view are trimmed to this before calling
 * these helpers.
 *
 * Populated by `useHostIdsWithKessel`, which injects `permissions.hasWorkspaceEdit` per host:
 * - Grouped hosts: `true` when the user has Kessel `workspace` + `edit` on that host's workspace.
 * - Ungrouped hosts (no `groups[0]`): defaults to `true` when group membership is unknown.
 *
 * @typedef {object} MoveSystemActionsColumnRow
 *  @property {object}  [permissions]                  - Kessel permission flags from `useHostIdsWithKessel`
 *  @property {boolean} [permissions.hasWorkspaceEdit] - Whether the user may move this host out of
 *                                                     its current workspace under Kessel RBAC
 *
 * @example
 * // Inventory row after useHostIdsWithKessel
 * { permissions: { hasWorkspaceEdit: true } }
 *
 * @example
 * // Systems view row action (permissions only)
 * { permissions: system.permissions }
 */

/**
 * Whether the current user may move a host under Kessel RBAC (host-level gate).
 *
 *  @param   {MoveSystemActionsColumnRow} row - Host row or `{ permissions }` subset with
 *                                            `hasWorkspaceEdit` from `useHostIdsWithKessel`
 *  @returns {boolean}                        `true` when move is permitted for this host; `false` when missing or denied
 */
export const hasWorkspaceEdit = (row) =>
  row.permissions?.hasWorkspaceEdit ?? false;

/**
 * Whether a single-host “Move system” control should be disabled (Kessel path).
 *
 * Disabled when the page-level workspace gate is closed or the host lacks `hasWorkspaceEdit`.
 *
 *  @param   {MoveSystemActionsColumnRow} row                     - Host row with `permissions.hasWorkspaceEdit` (see
 *                                                                {@link MoveSystemActionsColumnRow})
 *  @param   {boolean}                    workspaceActionsAllowed - Page-level gate: user may perform workspace actions
 *                                                                on this view. `true` on inventory list and Systems view (no workspace-detail RBAC gate);
 *                                                                on workspace detail, pass `canModifyWorkspaceForActions` from GroupSystems.
 *  @returns {boolean}                                            `true` when the move action should be disabled
 */
export const isKesselMoveSystemRowDisabled = (row, workspaceActionsAllowed) =>
  !workspaceActionsAllowed || !hasWorkspaceEdit(row);

/**
 * Whether bulk “Move systems” should be disabled (Kessel path).
 *
 *  @param   {boolean}                      workspaceActionsAllowed - Same page-level gate as
 *                                                                  {@link isKesselMoveSystemRowDisabled}
 *  @param   {MoveSystemActionsColumnRow[]} selectedHosts           - Table selection: each entry is a host row
 *                                                                  (or `{ permissions }` only) with `permissions.hasWorkspaceEdit`. Typically
 *                                                                  `selectedSystemsList` from GroupSystems bulk toolbar.
 *  @returns {boolean}                                              `true` when bulk move should be disabled (no selection, gate closed, or any
 *                                                                  selected host lacks workspace edit)
 */
export const isKesselBulkMoveSystemsDisabled = (
  workspaceActionsAllowed,
  selectedHosts,
) =>
  !workspaceActionsAllowed ||
  selectedHosts.length === 0 ||
  selectedHosts.some((host) => !hasWorkspaceEdit(host));

/**
 * Disabled state for workspace-detail bulk remove (legacy) or bulk move (Kessel).
 *
 * Encapsulates GroupSystems toolbar rules so Kessel and legacy paths share one entry point.
 *
 *  @param   {object}                       params                         - Bulk action disable inputs from GroupSystems
 *  @param   {boolean}                      params.isKesselEnabled         - From `useKesselMigrationFeatureFlag()`; picks Kessel
 *                                                                         bulk-move vs legacy bulk-remove rules
 *  @param   {boolean}                      params.workspaceActionsAllowed - Page-level workspace modify gate (GroupSystems:
 *                                                                         `canModifyWorkspaceForActions`)
 *  @param   {boolean}                      params.ungrouped               - Workspace detail flag: viewing the synthetic “Ungrouped
 *                                                                         Hosts” workspace; legacy bulk remove stays disabled when `true`
 *  @param   {number}                       params.selectedCount           - Number of checked rows in the table
 *  @param   {MoveSystemActionsColumnRow[]} params.selectedHosts           - Selected host rows with
 *                                                                         `permissions.hasWorkspaceEdit` (GroupSystems: `selectedSystemsList`); used only when
 *                                                                         `isKesselEnabled` is `true`
 *  @returns {boolean}                                                     `true` when the bulk toolbar action should be disabled
 */
export const getGroupSystemsBulkActionDisabled = ({
  isKesselEnabled,
  workspaceActionsAllowed,
  ungrouped,
  selectedCount,
  selectedHosts,
}) => {
  if (isKesselEnabled) {
    return isKesselBulkMoveSystemsDisabled(
      workspaceActionsAllowed,
      selectedHosts,
    );
  }

  return ungrouped || !workspaceActionsAllowed || selectedCount === 0;
};

/**
 * Builds a PatternFly `ActionsColumn` item descriptor for “Move system” (Systems view).
 *
 *  @param   {MoveSystemActionsColumnRow} row                     - `{ permissions }` from the system row (see
 *                                                                {@link MoveSystemActionsColumnRow})
 *  @param   {Function}                   onClick                 - Opens move modal,
 *                                                                e.g. `() => openAddToWorkspaceModal([system])`
 *  @param   {boolean}                    workspaceActionsAllowed - Page-level gate; Systems view passes `true`
 *  @returns {object}                                             ActionsColumn item: `{ title, onClick, isDisabled, tooltipProps? }` where
 *                                                                `title` is `MOVE_SYSTEM_MENU_TEXT` and `tooltipProps` is set when disabled
 */
export const buildMoveSystemActionsColumnItem = (
  row,
  onClick,
  workspaceActionsAllowed,
) => {
  const isDisabled = isKesselMoveSystemRowDisabled(
    row,
    workspaceActionsAllowed,
  );
  return {
    title: MOVE_SYSTEM_MENU_TEXT,
    onClick,
    isDisabled,
    ...(isDisabled && {
      tooltipProps: { content: NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE },
    }),
  };
};

export const buildCells = (item, columns, extra) => {
  return columns.map(({ key, composed, renderFunc }) => {
    const data = composed ? (
      <Fragment>
        <TitleColumn id={item.id} item={item} {...extra}>
          {composed.map((key) => get(item, key, ' '))}
        </TitleColumn>
      </Fragment>
    ) : (
      get(item, key, ' ')
    );
    return renderFunc ? (
      <Fragment>{renderFunc(data, item.id, item, extra)}</Fragment>
    ) : (
      data
    );
  });
};

//returns an array of objects representing rows for a table.
//The function takes three parameters: "rows", "columns", and an object with several optional properties.
//The "rows" parameter is an array of objects, where each object represents a single row.
//The "columns" parameter is also an array of objects, where each object represents a single column in the table.
//The third parameter is an object with several optional properties, including "actions",
//"expandable", "noSystemsTable", and "extra". These properties are destructured from
//the object using object destructuring syntax.
export const createRows = (
  rows = [],
  columns = [],
  { actions, expandable, noSystemsTable, ...extra } = {},
) => {
  if (rows.length === 0) {
    return [
      {
        cells: [
          {
            title: noSystemsTable,
            props: {
              colSpan: columns.length + Boolean(actions),
              dataLabel: null,
            },
          },
        ],
      },
    ];
  }

  //If the "rows" parameter is not empty, the function maps over each row object in the "rows"
  //array and creates an array of two objects for each row. The first object represents the
  //row itself and contains the "cells" property, which is an array of objects representing
  //each cell in the row. The "actionProps" property is also set to an object containing the
  //"data-ouia-component-id" property, which is set to a string combining the row's "id" property
  //and the string "-actions-kebab".
  return flatten(
    rows.map((oneItem, key) => [
      {
        ...oneItem,
        ...(oneItem.children && expandable && { isOpen: !!oneItem.isOpen }),
        cells: buildCells(oneItem, columns, extra),
        actionProps: {
          'data-ouia-component-id': `${oneItem.id}-actions-kebab`,
        },
      },
      //The second object represents the child row, which is only created if the "expandable"
      //property is set to true and the row has a "children" property. This object has the
      //"cells" property set to an array containing a single object representing the cell
      //in the row. The "parent" property is set to the index of the parent row multiplied by 2,
      //and the "fullWidth" property is set to true.
      oneItem.children &&
        expandable && {
          cells: [
            {
              title:
                typeof oneItem.children === 'function'
                  ? oneItem.children()
                  : oneItem.children,
            },
          ],
          parent: key * 2,
          fullWidth: true,
        },
    ]),
  ).filter(Boolean);
};

export const onDeleteFilter = (deleted, currFilter = []) => {
  const { value: deletedItem } = deleted?.chips?.[0] || {};
  return currFilter.filter((item) => {
    if (typeof item === 'object' && item !== null) {
      return item.id !== deletedItem;
    }
    return item !== deletedItem;
  });
};

const buildNewCategoryTags = (deleted, category, categoryTags) =>
  Object.entries(categoryTags).reduce((newCategoryTags, [tagName, tag]) => {
    if (tag == null) return newCategoryTags;
    const isDeleted =
      deleted.category === category &&
      deleted.chips?.[0]?.value === tag.item?.meta?.tag?.value &&
      deleted.chips?.[0]?.tagKey === tag.item?.meta?.tag?.key;
    return [...newCategoryTags, ...(isDeleted ? [] : [[tagName, tag]])];
  }, []);

export const onDeleteTag = (deleted, selectedTags, onApplyTags) => {
  const newSelectedTags = Object.fromEntries(
    Object.entries(selectedTags).reduce((newTags, [category, categoryTags]) => {
      const newCategoryTags = buildNewCategoryTags(
        deleted,
        category,
        categoryTags,
      );

      return [
        ...newTags,
        ...(newCategoryTags.length
          ? [[category, Object.fromEntries(newCategoryTags)]]
          : []),
      ];
    }, []),
  );

  if (onApplyTags) onApplyTags(newSelectedTags, false);
  return newSelectedTags;
};

export const onDeleteGroupFilter = (deleted, currFilter) =>
  Object.fromEntries(
    Object.entries(currFilter).map(([groupKey, group]) => [
      groupKey,
      Object.fromEntries(
        Object.entries(group).filter(
          ([itemKey]) =>
            itemKey !== deleted?.chips?.[0].value && itemKey !== groupKey,
        ),
      ),
    ]),
  );

const includesSortable = (transforms) =>
  transforms?.reduce(
    (acc, fn) => acc || fn.toString().includes('onSort:'),
    false,
  );

export const createColumns = (columns, hasItems, rows, isExpandable) =>
  columns?.map(({ props, transforms, cellFormatters, ...oneCell }) => ({
    ...oneCell,
    transforms: [
      ...(transforms || []),
      ...(props?.width ? [cellWidth(props.width)] : []),
      ...(hasItems ||
      rows.length <= 0 ||
      (props && props.isStatic) ||
      transforms?.includes(sortable) ||
      includesSortable(transforms)
        ? []
        : [sortable]),
    ],
    cellFormatters: [
      ...(cellFormatters || []),
      ...(isExpandable ? [expandable] : []),
    ],
  }));

export const generateLoadingRows = (colsNumber, rowsNumber) =>
  Array(rowsNumber).fill({
    disableSelection: true,
    cells: Array(colsNumber).fill({ title: <Skeleton /> }),
  });
