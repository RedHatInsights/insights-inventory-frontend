import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { validateGroupName } from '../utils/api';
import CreateGroupModal, { validate } from './CreateGroupModal';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('../utils/api');
jest.mock('react-redux');

describe('validate function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('works with basic input', async () => {
    const result = await validate('test');

    expect(result).toBeUndefined();
    expect(validateGroupName).toHaveBeenCalledWith('test');
  });

  it('trims input', async () => {
    const result = await validate(' test ');

    expect(result).toBeUndefined();
    expect(validateGroupName).toHaveBeenCalledWith('test');
  });

  it('throws error if the name is present', async () => {
    validateGroupName.mockResolvedValue(true);

    await expect(validate('test')).rejects.toBe('Group name already exists');
  });

  it('does not check on undefined input', async () => {
    const result = await validate(undefined);

    expect(result).toBeUndefined();
    expect(validateGroupName).not.toHaveBeenCalled();
  });

  it('does not check on empty input', async () => {
    const result = await validate('');

    expect(result).toBeUndefined();
    expect(validateGroupName).not.toHaveBeenCalled();
  });
});

describe('create group modal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const setIsModalOpen = jest.fn();
  const reloadData = jest.fn();

  it('create button is initially disabled', () => {
    render(
      <CreateGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        reloadData={reloadData}
      />
    );

    expect(
      screen.getByRole('button', {
        name: /create/i,
      })
    ).toBeDisabled();
  });

  it('can create a group with new name', async () => {
    validateGroupName.mockResolvedValue(false);

    render(
      <CreateGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        reloadData={reloadData}
      />
    );

    await userEvent.type(
      screen.getByRole('textbox', {
        name: /group name/i,
      }),
      '_abc'
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /create/i,
        })
      ).toBeEnabled();
    });
  });

  it('cannot create a group with incorrect name', async () => {
    render(
      <CreateGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        reloadData={reloadData}
      />
    );

    expect(
      screen.getByRole('button', {
        name: /create/i,
      })
    ).toBeDisabled();

    await userEvent.type(
      screen.getByRole('textbox', {
        name: /group name/i,
      }),
      '###'
    );

    expect(
      screen.getByRole('button', {
        name: /create/i,
      })
    ).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', {
        name: /create/i,
      })
    ); // must change focus for the hint to appear (DDF implementation)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Valid characters include letters, numbers, spaces, hyphens ( - ), and underscores ( _ ).'
        )
      ).toBeVisible();
    });
  });
});
