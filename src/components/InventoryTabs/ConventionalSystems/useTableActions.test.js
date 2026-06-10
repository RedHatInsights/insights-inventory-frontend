/* eslint-disable react/prop-types -- inline ActionWithRBAC stubs */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MOVE_SYSTEM_MENU_TEXT } from '../../../constants';
import useTableActions from './useTableActions';

jest.mock('../../InventoryTable/ActionWithRBAC', () => ({
  ActionDropdownItem: ({ children, onClick, isAriaDisabled, override }) => (
    <button
      type="button"
      role="menuitem"
      aria-disabled={isAriaDisabled || undefined}
      data-override={override === undefined ? 'undefined' : String(override)}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock('../../InventoryTable/MoveSystemActionDropdownItem', () => ({
  MoveSystemActionDropdownItem: ({ onClick, isAriaDisabled, override }) => (
    <button
      type="button"
      role="menuitem"
      aria-disabled={isAriaDisabled || undefined}
      data-override={override === undefined ? 'undefined' : String(override)}
      onClick={onClick}
    >
      {MOVE_SYSTEM_MENU_TEXT}
    </button>
  ),
}));

const rowInGroup = {
  id: 'host-1',
  groups: [{ id: 'g1', name: 'Workspace A' }],
  permissions: { hasWorkspaceEdit: true, hasUpdate: true, hasDelete: true },
};

const rowUngrouped = {
  id: 'host-2',
  groups: [{ id: 'g0', name: 'Ungrouped Hosts', ungrouped: true }],
  permissions: { hasWorkspaceEdit: true, hasUpdate: true, hasDelete: true },
};

function renderActions(actions) {
  return render(
    <>
      {actions.map((action, index) => (
        <div key={action.itemKey ?? index}>{action.title}</div>
      ))}
    </>,
  );
}

describe('useTableActions', () => {
  const setCurrentSystem = jest.fn();
  const onEditOpen = jest.fn();
  const handleModalToggle = jest.fn();
  const setRemoveHostsFromGroupModalOpen = jest.fn();
  const setAddHostGroupModalOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Kessel enabled', () => {
    it('shows Move system instead of add/remove workspace actions', () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          true,
        ),
      );

      renderActions(result.current(rowInGroup));

      expect(
        screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Add to workspace' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Remove from workspace' }),
      ).not.toBeInTheDocument();
    });

    it('opens move modal when Move system is clicked', async () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          true,
        ),
      );

      renderActions(result.current(rowInGroup));
      await userEvent.click(
        screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      );

      expect(setCurrentSystem).toHaveBeenCalledWith([rowInGroup]);
      expect(setAddHostGroupModalOpen).toHaveBeenCalledWith(true);
    });

    it('disables Move system when host lacks workspace edit', () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          true,
        ),
      );

      renderActions(
        result.current({
          ...rowInGroup,
          permissions: { ...rowInGroup.permissions, hasWorkspaceEdit: false },
        }),
      );

      expect(
        screen.getByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('uses Kessel edit and delete labels', () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          true,
        ),
      );

      renderActions(result.current(rowInGroup));

      expect(
        screen.getByRole('menuitem', { name: 'Edit' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Delete' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Edit display name' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('legacy path', () => {
    it('shows add and remove workspace actions', () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          false,
        ),
      );

      renderActions(result.current(rowInGroup));

      expect(
        screen.getByRole('menuitem', { name: 'Add to workspace' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Remove from workspace' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: MOVE_SYSTEM_MENU_TEXT }),
      ).not.toBeInTheDocument();
    });

    it('disables Add to workspace when host is already in a group', () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          false,
        ),
      );

      renderActions(result.current(rowInGroup));

      expect(
        screen.getByRole('menuitem', { name: 'Add to workspace' }),
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables Remove from workspace for ungrouped hosts', () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          false,
        ),
      );

      renderActions(result.current(rowUngrouped));

      expect(
        screen.getByRole('menuitem', { name: 'Remove from workspace' }),
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('opens remove modal when Remove from workspace is clicked', async () => {
      const { result } = renderHook(() =>
        useTableActions(
          setCurrentSystem,
          onEditOpen,
          handleModalToggle,
          setRemoveHostsFromGroupModalOpen,
          setAddHostGroupModalOpen,
          false,
        ),
      );

      renderActions(result.current(rowInGroup));
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Remove from workspace' }),
      );

      expect(setCurrentSystem).toHaveBeenCalledWith([rowInGroup]);
      expect(setRemoveHostsFromGroupModalOpen).toHaveBeenCalledWith(true);
    });
  });
});
