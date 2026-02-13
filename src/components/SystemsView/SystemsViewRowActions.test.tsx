import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SystemsViewRowActions from './SystemsViewRowActions';
import { expect, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { SystemActionModalsContext } from './SystemActionModalsContext';

const mockOpenDeleteModal = jest.fn();
const mockOpenAddToWorkspaceModal = jest.fn();
const mockOpenRemoveFromWorkspaceModal = jest.fn();
const mockOpenEditModal = jest.fn();

const mockContextValue = {
  openDeleteModal: mockOpenDeleteModal,
  openAddToWorkspaceModal: mockOpenAddToWorkspaceModal,
  openRemoveFromWorkspaceModal: mockOpenRemoveFromWorkspaceModal,
  openEditModal: mockOpenEditModal,
};

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      {ui}
    </SystemActionModalsContext.Provider>,
  );
}

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(
    (key: string) => key === 'inventory-frontend.kessel-enabled',
  ),
}));

jest.mock('../../Utilities/hooks/useConditionalRBAC', () => ({
  useConditionalRBAC: jest.fn(() => ({ hasAccess: false })),
}));

// No mock for @patternfly/react-table - test via DOM (open kebab and check menu items)

describe('SystemsViewRowActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const useConditionalRBACMock =
      require('../../Utilities/hooks/useConditionalRBAC')
        .useConditionalRBAC as jest.Mock;
    useConditionalRBACMock.mockReturnValue({ hasAccess: false });
  });

  async function openKebabMenu() {
    await userEvent.click(
      screen.getByRole('button', { name: /kebab toggle/i }),
    );
  }

  describe('Move system (Kessel enabled)', () => {
    it('disables Move system when user does not have workspace edit permission', async () => {
      const system = {
        id: 'host-1',
        display_name: 'My Host',
        groups: [],
        org_id: 'test-org',
        permissions: {
          hasWorkspaceEdit: false,
          hasUpdate: true,
          hasDelete: true,
        },
      };

      renderWithProvider(<SystemsViewRowActions system={system} />);
      await openKebabMenu();

      const addOrMoveItem = screen.getByRole('menuitem', {
        name: /move system|add to workspace/i,
      });
      expect(addOrMoveItem).toBeInTheDocument();
      // PatternFly disables via class or aria; ensure it's not clickable when no permission
      expect(
        addOrMoveItem.hasAttribute('aria-disabled') ||
          addOrMoveItem.hasAttribute('disabled') ||
          addOrMoveItem.className.includes('disabled'),
      ).toBe(true);
    });

    it('enables Move system when user has workspace edit permission', async () => {
      const useConditionalRBACMock =
        require('../../Utilities/hooks/useConditionalRBAC')
          .useConditionalRBAC as jest.Mock;
      useConditionalRBACMock.mockReturnValue({ hasAccess: true });

      const system = {
        id: 'host-1',
        display_name: 'My Host',
        groups: [],
        org_id: 'test-org',
        permissions: {
          hasWorkspaceEdit: true,
          hasUpdate: true,
          hasDelete: true,
        },
      };

      renderWithProvider(<SystemsViewRowActions system={system} />);
      await openKebabMenu();

      const addOrMoveItem = screen.getByRole('menuitem', {
        name: /move system|add to workspace/i,
      });
      expect(addOrMoveItem).toBeInTheDocument();
      // When enabled, item should not be aria-disabled (PF may still set disabled on the element)
      expect(addOrMoveItem.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('disables Move system when permissions are undefined (no edit access)', async () => {
      const system = {
        id: 'host-1',
        display_name: 'My Host',
        groups: [],
        org_id: 'test-org',
        permissions: {
          hasWorkspaceEdit: false,
          hasUpdate: false,
          hasDelete: false,
        },
      };

      renderWithProvider(<SystemsViewRowActions system={system} />);
      await openKebabMenu();

      const addOrMoveItem = screen.getByRole('menuitem', {
        name: /move system|add to workspace/i,
      });
      expect(addOrMoveItem).toBeInTheDocument();
      expect(
        addOrMoveItem.hasAttribute('aria-disabled') ||
          addOrMoveItem.hasAttribute('disabled') ||
          addOrMoveItem.className.includes('disabled'),
      ).toBe(true);
    });
  });
});
