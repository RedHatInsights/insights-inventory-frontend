import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { removeHostsFromGroup } from '../../utils/api';
import RemoveHostsFromGroupModal from '../RemoveHostsFromGroupModal';
import useWorkspaceFeatureFlag from '../../../../Utilities/hooks/useWorkspaceFeatureFlag';

jest.mock('react-redux');
jest.mock('../../utils/api');
jest.mock('../../../../Utilities/hooks/useWorkspaceFeatureFlag');

describe('RemoveHostsFromGroupModal', () => {
  const setIsModalOpen = jest.fn();

  beforeEach(() => {
    useWorkspaceFeatureFlag.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows correct text, single group', () => {
    render(
      <RemoveHostsFromGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        modalState={[{ display_name: 'host-1', groups: [{ name: 'group-1' }] }]}
      />
    );

    expect(screen.getByTestId('desc')).toHaveTextContent(
      'host-1 will no longer be part of group-1 and its configuration will be impacted.'
    );
  });

  it('shows correct text, more groups', () => {
    render(
      <RemoveHostsFromGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        modalState={[
          { display_name: 'host-1', groups: [{ name: 'group-1' }] },
          { display_name: 'host-2', groups: [{ name: 'group-1' }] },
        ]}
      />
    );

    expect(screen.getByTestId('desc')).toHaveTextContent(
      '2 systems will no longer be part of group-1 and their configuration will be impacted.'
    );
  });

  it('can close the modal', async () => {
    render(
      <RemoveHostsFromGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        modalState={[{ display_name: 'host-1', groups: [{ name: 'group-1' }] }]}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /close/i,
      })
    );

    expect(setIsModalOpen).toBeCalled();
  });

  it('can cancel the deletion', async () => {
    render(
      <RemoveHostsFromGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        modalState={[{ display_name: 'host-1', groups: [{ name: 'group-1' }] }]}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /cancel/i,
      })
    );

    expect(setIsModalOpen).toBeCalled();
  });

  it('can remove single group', async () => {
    render(
      <RemoveHostsFromGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        modalState={[
          {
            display_name: 'host-1',
            id: 'h1',
            groups: [{ name: 'group-1', id: 'g1' }],
          },
        ]}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /remove/i,
      })
    );

    expect(removeHostsFromGroup).toBeCalledWith('g1', ['h1']);
  });

  it('can remove more groups', async () => {
    render(
      <RemoveHostsFromGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        modalState={[
          {
            display_name: 'host-1',
            id: 'h1',
            groups: [{ name: 'group-1', id: 'g1' }],
          },
          {
            display_name: 'host-2',
            id: 'h2',
            groups: [{ name: 'group-1', id: 'g1' }],
          },
        ]}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /remove/i,
      })
    );

    expect(removeHostsFromGroup).toBeCalledWith('g1', ['h1', 'h2']);
  });
});
