import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import MoveSystemsToWorkspaceModal, {
  type SystemForWorkspace,
} from './MoveSystemsToWorkspaceModal';

const mockAddNotification = jest.fn();
const mockSetIsModalOpen = jest.fn();
const mockReloadData = jest.fn();

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => mockAddNotification,
  }),
);

const singleSystem: SystemForWorkspace = {
  id: 'host-1',
  display_name: 'My Host',
  groups: [{ id: 'g1', name: 'Current Workspace' }],
};

const multipleSystems: SystemForWorkspace[] = [
  {
    id: 'host-1',
    display_name: 'Host One',
    groups: [{ id: 'g1', name: 'Workspace A' }],
  },
  {
    id: 'host-2',
    display_name: 'Host Two',
    groups: [{ id: 'g2', name: 'Workspace B' }],
  },
];

function renderModal(
  props: {
    isModalOpen?: boolean;
    modalState?: SystemForWorkspace[] | SystemForWorkspace;
    setIsModalOpen?: (open: boolean) => void;
    reloadData?: () => void | Promise<void>;
  } = {},
) {
  const {
    isModalOpen = true,
    modalState = singleSystem,
    setIsModalOpen = mockSetIsModalOpen,
    reloadData = mockReloadData as () => void | Promise<void>,
  } = props;
  return render(
    <MoveSystemsToWorkspaceModal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      modalState={modalState}
      reloadData={reloadData}
    />,
  );
}

describe('MoveSystemsToWorkspaceModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('does not show modal content when isModalOpen is false', () => {
      renderModal({ isModalOpen: false });
      expect(
        screen.queryByRole('heading', { name: /move system/i }),
      ).not.toBeInTheDocument();
    });

    it('shows modal when isModalOpen is true', () => {
      renderModal();
      expect(
        screen.getByRole('heading', { name: 'Move system' }),
      ).toBeInTheDocument();
    });
  });

  describe('single system', () => {
    it('shows "Move system" title and system details', () => {
      renderModal({ modalState: singleSystem });
      expect(
        screen.getByRole('heading', { name: 'Move system' }),
      ).toBeInTheDocument();
      expect(screen.getByText('My Host')).toBeInTheDocument();
      expect(screen.getByText('Current Workspace')).toBeInTheDocument();
      expect(
        screen.getByText(/Moving a system to a different workspace/),
      ).toBeInTheDocument();
    });

    it('uses system id when display_name is missing', () => {
      renderModal({
        modalState: { id: 'host-99', groups: [{ id: 'g1', name: 'WS' }] },
      });
      expect(screen.getByText('host-99')).toBeInTheDocument();
    });

    it('shows Destination workspace label and workspace selector', () => {
      renderModal();
      expect(screen.getByText('Destination workspace')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Select workspace' }),
      ).toBeInTheDocument();
    });

    it('disables Move button until a workspace is selected', () => {
      renderModal();
      expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
    });

    it('shows "Create one here" link when no workspace selected', () => {
      renderModal();
      expect(
        screen.getByRole('link', { name: 'Create one here' }),
      ).toBeInTheDocument();
      expect(
        (
          screen.getByRole('link', {
            name: 'Create one here',
          }) as HTMLAnchorElement
        ).href,
      ).toContain('/iam/user-access/workspaces/create-workspace');
    });

    it('enables Move and shows confirmation alert after selecting workspace', async () => {
      renderModal();
      await userEvent.click(
        screen.getByRole('button', { name: 'Select workspace' }),
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Move' })).toBeEnabled();
      });
      // Confirmation text may be split across elements (e.g. Alert title)
      expect(screen.getByText(/this action will move/i)).toBeInTheDocument();
      expect(screen.getByText(/test workspace/i)).toBeInTheDocument();
    });
  });

  describe('multiple systems', () => {
    it('shows "Move systems" title and table', () => {
      renderModal({ modalState: multipleSystems });
      expect(
        screen.getByRole('heading', { name: 'Move systems' }),
      ).toBeInTheDocument();
      expect(screen.getByText('System name')).toBeInTheDocument();
      expect(screen.getByText('Current workspace')).toBeInTheDocument();
      expect(screen.getByText('Host One')).toBeInTheDocument();
      expect(screen.getByText('Host Two')).toBeInTheDocument();
      expect(screen.getByText('Workspace A')).toBeInTheDocument();
      expect(screen.getByText('Workspace B')).toBeInTheDocument();
    });

    it('after selecting workspace shows alert with "from multiple workspaces"', async () => {
      renderModal({ modalState: multipleSystems });
      await userEvent.click(
        screen.getByRole('button', { name: 'Select workspace' }),
      );
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Move' })).toBeEnabled();
      });
      expect(screen.getByText(/this action will move/i)).toBeInTheDocument();
      expect(screen.getByText(/multiple workspaces/i)).toBeInTheDocument();
    });
  });

  describe('Cancel', () => {
    it('calls setIsModalOpen(false) when Cancel is clicked', async () => {
      renderModal();
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockSetIsModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('label help', () => {
    it('has accessible label help for workspace selector', () => {
      renderModal();
      expect(
        screen.getByLabelText('More info for workspace selector'),
      ).toBeInTheDocument();
    });
  });
});
