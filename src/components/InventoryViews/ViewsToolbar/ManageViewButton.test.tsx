import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ManageViewButton, getPrimaryAction } from './ManageViewButton';

const defaultProps = {
  isSystemView: false,
  isViewDirty: false,
  isOwner: true,
  onSaveAs: jest.fn(),
  onRename: jest.fn(),
  onDelete: jest.fn(),
  onSave: jest.fn(),
};

function renderManageViewButton(props = {}) {
  return render(<ManageViewButton {...defaultProps} {...props} />);
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Manage view actions' }));
  return user;
}

describe('getPrimaryAction', () => {
  const onSave = jest.fn();
  const onSaveAs = jest.fn();

  it.each([
    [false, false, true, null],
    [true, false, true, { label: 'Save', onClick: onSave }],
    [true, true, false, { label: 'Save as', onClick: onSaveAs }],
    [true, true, true, { label: 'Save as', onClick: onSaveAs }],
    [true, false, false, { label: 'Save as', onClick: onSaveAs }],
  ])(
    'given dirty=%s systemView=%s owner=%s, returns %p',
    (isViewDirty, isSystemView, isOwner, expected) => {
      expect(
        getPrimaryAction(isViewDirty, isSystemView, isOwner, onSave, onSaveAs),
      ).toEqual(expected);
    },
  );
});

describe('ManageViewButton', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('primary toggle action', () => {
    it.each([
      {
        isViewDirty: false,
        isSystemView: false,
        isOwner: true,
        expected: 'Manage view',
      },
      {
        isViewDirty: true,
        isSystemView: false,
        isOwner: true,
        expected: 'Save',
      },
      {
        isViewDirty: true,
        isSystemView: true,
        isOwner: false,
        expected: 'Save as',
      },
      {
        isViewDirty: true,
        isSystemView: false,
        isOwner: false,
        expected: 'Save as',
      },
      {
        isViewDirty: true,
        isSystemView: true,
        isOwner: true,
        expected: 'Save as',
      },
    ])(
      'renders "$expected" (dirty=$isViewDirty, systemView=$isSystemView, owner=$isOwner)',
      ({ isViewDirty, isSystemView, isOwner, expected }) => {
        renderManageViewButton({ isViewDirty, isSystemView, isOwner });

        expect(
          screen.getByRole('button', { name: expected }),
        ).toBeInTheDocument();

        const other = expected === 'Manage view' ? 'Save' : 'Manage view';
        expect(
          screen.queryByRole('button', { name: other }),
        ).not.toBeInTheDocument();
      },
    );

    it('calls onSave when the primary "Save" action is clicked', async () => {
      const onSave = jest.fn();
      const user = userEvent.setup();
      renderManageViewButton({
        isViewDirty: true,
        isSystemView: false,
        isOwner: true,
        onSave,
      });

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('calls onSaveAs when the primary "Save as" action is clicked on All system view', async () => {
      const onSaveAs = jest.fn();
      const user = userEvent.setup();
      renderManageViewButton({
        isViewDirty: true,
        isSystemView: true,
        isOwner: false,
        onSaveAs,
      });

      await user.click(screen.getByRole('button', { name: 'Save as' }));
      expect(onSaveAs).toHaveBeenCalledTimes(1);
    });
  });

  describe('dropdown items', () => {
    it('always offers "Save as" and calls onSaveAs when clicked', async () => {
      const onSaveAs = jest.fn();
      renderManageViewButton({ onSaveAs, isViewDirty: false });

      const user = await openMenu();
      const saveAsItem = screen.getByRole('menuitem', { name: 'Save as' });
      expect(saveAsItem).toBeEnabled();

      await user.click(saveAsItem);
      expect(onSaveAs).toHaveBeenCalledTimes(1);
    });

    it('disables Rename and Delete for system views', async () => {
      renderManageViewButton({ isSystemView: true });

      await openMenu();
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeDisabled();
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
    });

    it('enables Rename and Delete for custom views', async () => {
      renderManageViewButton({ isSystemView: false });

      await openMenu();
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeEnabled();
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeEnabled();
    });

    it('disables the "Save" item when the view is not dirty', async () => {
      renderManageViewButton({
        isViewDirty: false,
        isSystemView: false,
        isOwner: true,
      });

      await openMenu();
      expect(screen.getByRole('menuitem', { name: 'Save' })).toBeDisabled();
    });

    it('disables the "Save" item on a dirty system view', async () => {
      renderManageViewButton({
        isViewDirty: true,
        isSystemView: true,
        isOwner: true,
      });

      await openMenu();
      expect(screen.getByRole('menuitem', { name: 'Save' })).toBeDisabled();
    });

    it('disables the "Save" item for a dirty custom view the user does not own', async () => {
      renderManageViewButton({
        isViewDirty: true,
        isSystemView: false,
        isOwner: false,
      });

      await openMenu();
      expect(screen.getByRole('menuitem', { name: 'Save' })).toBeDisabled();
    });

    it('enables the "Save" item for a dirty, owned custom view and calls onSave when clicked', async () => {
      const onSave = jest.fn();
      renderManageViewButton({
        isViewDirty: true,
        isSystemView: false,
        isOwner: true,
        onSave,
      });

      const user = await openMenu();
      const saveItem = screen.getByRole('menuitem', { name: 'Save' });
      expect(saveItem).toBeEnabled();

      await user.click(saveItem);
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });
});
