/* eslint-disable react/prop-types -- inline ActionWithRBAC stubs */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MOVE_SYSTEMS_MENU_TEXT, MOVE_SYSTEM_MENU_TEXT } from '../../constants';
import {
  getBulkActionConfig,
  getRowActionItem,
  openModalForSystems,
} from './groupSystemsActions';

jest.mock('../InventoryTable/ActionWithRBAC', () => ({
  ActionDropdownItem: ({ children, onClick, isAriaDisabled, tooltipProps }) => (
    <button
      type="button"
      role="menuitem"
      aria-disabled={isAriaDisabled || undefined}
      data-tooltip={tooltipProps?.content}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock('../InventoryTable/MoveSystemActionDropdownItem', () => ({
  MoveSystemActionDropdownItem: ({ onClick, isAriaDisabled, tooltipProps }) => (
    <button
      type="button"
      role="menuitem"
      aria-disabled={isAriaDisabled || undefined}
      data-tooltip={tooltipProps?.content}
      onClick={onClick}
    >
      {MOVE_SYSTEM_MENU_TEXT}
    </button>
  ),
}));

const baseRow = {
  id: 'host-1',
  permissions: { hasWorkspaceEdit: true },
};

const baseRowActionParams = {
  row: baseRow,
  isKesselEnabled: true,
  ungrouped: false,
  canModifyWorkspaceForActions: true,
  noAccessEditTooltip: 'No access',
  kesselActionOverride: true,
  removeLabel: 'Remove from workspace',
  requiredPermissions: ['workspace:edit'],
  setCurrentSystem: jest.fn(),
  setMoveSystemsToWorkspaceModalOpen: jest.fn(),
  setRemoveHostsFromGroupModalOpen: jest.fn(),
};

const baseBulkParams = {
  isKesselEnabled: true,
  ungrouped: false,
  canModifyWorkspaceForActions: true,
  selectedCount: 2,
  selectedSystemsList: [
    { permissions: { hasWorkspaceEdit: true } },
    { permissions: { hasWorkspaceEdit: true } },
  ],
  removeLabel: 'Remove from workspace',
  setCurrentSystem: jest.fn(),
  setMoveSystemsToWorkspaceModalOpen: jest.fn(),
  setRemoveHostsFromGroupModalOpen: jest.fn(),
};

describe('groupSystemsActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openModalForSystems', () => {
    it('sets current system and opens the modal', () => {
      const setCurrentSystem = jest.fn();
      const setModalOpen = jest.fn();
      const systems = [baseRow];

      openModalForSystems(systems, setCurrentSystem, setModalOpen);

      expect(setCurrentSystem).toHaveBeenCalledWith(systems);
      expect(setModalOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('getRowActionItem', () => {
    it('renders Move system when Kessel is enabled', async () => {
      const element = getRowActionItem(baseRowActionParams);
      render(element);

      const item = screen.getByRole('menuitem', {
        name: MOVE_SYSTEM_MENU_TEXT,
      });
      expect(item).toBeInTheDocument();
      expect(item).not.toHaveAttribute('aria-disabled', 'true');

      await userEvent.click(item);
      expect(baseRowActionParams.setCurrentSystem).toHaveBeenCalledWith([
        baseRow,
      ]);
      expect(
        baseRowActionParams.setMoveSystemsToWorkspaceModalOpen,
      ).toHaveBeenCalledWith(true);
    });

    it('disables Move system when workspace actions are not allowed', () => {
      const element = getRowActionItem({
        ...baseRowActionParams,
        canModifyWorkspaceForActions: false,
      });
      render(element);

      expect(
        screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables Move system when host lacks workspace edit', () => {
      const element = getRowActionItem({
        ...baseRowActionParams,
        row: { ...baseRow, permissions: { hasWorkspaceEdit: false } },
      });
      render(element);

      expect(
        screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('renders Remove from workspace when Kessel is disabled', async () => {
      const element = getRowActionItem({
        ...baseRowActionParams,
        isKesselEnabled: false,
      });
      render(element);

      const item = screen.getByRole('menuitem', {
        name: 'Remove from workspace',
      });
      expect(item).toBeInTheDocument();

      await userEvent.click(item);
      expect(baseRowActionParams.setCurrentSystem).toHaveBeenCalledWith([
        baseRow,
      ]);
      expect(
        baseRowActionParams.setRemoveHostsFromGroupModalOpen,
      ).toHaveBeenCalledWith(true);
    });

    it('disables legacy remove when viewing ungrouped hosts', () => {
      const element = getRowActionItem({
        ...baseRowActionParams,
        isKesselEnabled: false,
        ungrouped: true,
      });
      render(element);

      expect(
        screen.getByRole('menuitem', { name: 'Remove from workspace' }),
      ).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('getBulkActionConfig', () => {
    it('returns Move systems bulk action when Kessel is enabled', () => {
      const config = getBulkActionConfig(baseBulkParams);

      expect(config.label).toBe(MOVE_SYSTEMS_MENU_TEXT);
      expect(config.isDisabled).toBe(false);

      config.onClick();
      expect(baseBulkParams.setCurrentSystem).toHaveBeenCalledWith(
        baseBulkParams.selectedSystemsList,
      );
      expect(
        baseBulkParams.setMoveSystemsToWorkspaceModalOpen,
      ).toHaveBeenCalledWith(true);
    });

    it('disables bulk Move systems when any selected host lacks workspace edit', () => {
      const config = getBulkActionConfig({
        ...baseBulkParams,
        selectedSystemsList: [
          { permissions: { hasWorkspaceEdit: true } },
          { permissions: { hasWorkspaceEdit: false } },
        ],
      });

      expect(config.isDisabled).toBe(true);
    });

    it('returns legacy remove bulk action when Kessel is disabled', () => {
      const config = getBulkActionConfig({
        ...baseBulkParams,
        isKesselEnabled: false,
      });

      expect(config.label).toBe('Remove from workspace');
      expect(config.isDisabled).toBe(false);

      config.onClick();
      expect(baseBulkParams.setCurrentSystem).toHaveBeenCalledWith(
        baseBulkParams.selectedSystemsList,
      );
      expect(
        baseBulkParams.setRemoveHostsFromGroupModalOpen,
      ).toHaveBeenCalledWith(true);
    });

    it('disables legacy bulk remove on ungrouped hosts workspace', () => {
      const config = getBulkActionConfig({
        ...baseBulkParams,
        isKesselEnabled: false,
        ungrouped: true,
      });

      expect(config.isDisabled).toBe(true);
    });

    it('disables legacy bulk remove when nothing is selected', () => {
      const config = getBulkActionConfig({
        ...baseBulkParams,
        isKesselEnabled: false,
        selectedCount: 0,
        selectedSystemsList: [],
      });

      expect(config.isDisabled).toBe(true);
    });
  });
});
