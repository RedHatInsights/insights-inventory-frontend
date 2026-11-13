import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { validateGroupName } from '../utils/api';
import CreateGroupModal, { validate } from './CreateGroupModal';
import { ignoreStaleValidationResults } from './utils/ignoreStaleValidationResults';
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

    await expect(validate('test')).rejects.toBe(
      'Workspace name already exists',
    );
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

describe('ignoreStaleValidationResults', () => {
  it('returns the latest result to every pending validation', async () => {
    const validator = jest.fn().mockResolvedValue('current-result');
    const validateLatest = ignoreStaleValidationResults(validator);

    await expect(validateLatest('current value')).resolves.toBe(
      'current-result',
    );
    expect(validator).toHaveBeenCalledWith('current value');
  });

  it('keeps the latest duplicate-name error when an older validation succeeds', async () => {
    let resolveOldValidation;
    let rejectCurrentValidation;
    const validator = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldValidation = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            rejectCurrentValidation = reject;
          }),
      );
    const validateLatest = ignoreStaleValidationResults(validator);

    const oldValidation = validateLatest('previous value');
    const currentValidation = validateLatest('duplicate name');
    await Promise.resolve();
    await Promise.resolve();

    rejectCurrentValidation('Workspace name already exists');
    await expect(currentValidation).rejects.toBe(
      'Workspace name already exists',
    );

    resolveOldValidation(undefined);
    await expect(oldValidation).rejects.toBe('Workspace name already exists');
  });

  it('keeps the latest valid result when an older validation rejects', async () => {
    let rejectOldValidation;
    let resolveCurrentValidation;
    const validator = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            rejectOldValidation = reject;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveCurrentValidation = resolve;
          }),
      );
    const validateLatest = ignoreStaleValidationResults(validator);

    const oldValidation = validateLatest('duplicate name');
    const currentValidation = validateLatest('corrected name');
    await Promise.resolve();
    await Promise.resolve();

    resolveCurrentValidation('valid');
    await expect(currentValidation).resolves.toBe('valid');

    rejectOldValidation('Workspace name already exists');
    await expect(oldValidation).resolves.toBe('valid');
  });

  it('keeps following the latest result across three overlapping validations', async () => {
    let rejectOldValidation;
    let resolveIntermediateValidation;
    let resolveLatestValidation;
    const validator = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            rejectOldValidation = reject;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveIntermediateValidation = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveLatestValidation = resolve;
          }),
      );
    const validateLatest = ignoreStaleValidationResults(validator);

    const oldValidation = validateLatest('old value');
    const intermediateValidation = validateLatest('intermediate value');
    await Promise.resolve();
    await Promise.resolve();

    rejectOldValidation('stale duplicate-name error');
    await Promise.resolve();

    const latestValidation = validateLatest('latest value');
    await Promise.resolve();
    await Promise.resolve();

    resolveIntermediateValidation('intermediate result');
    await Promise.resolve();
    resolveLatestValidation('latest result');

    await expect(
      Promise.all([oldValidation, intermediateValidation, latestValidation]),
    ).resolves.toEqual(['latest result', 'latest result', 'latest result']);
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
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /create/i,
      }),
    ).toBeDisabled();
  });

  it('can create a group with new name', async () => {
    validateGroupName.mockResolvedValue(false);

    render(
      <CreateGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        reloadData={reloadData}
      />,
    );

    await userEvent.type(
      screen.getByRole('textbox', {
        name: /workspace name/i,
      }),
      '_abc',
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /create/i,
        }),
      ).toBeEnabled();
    });
  });

  it('cannot create a group with incorrect name', async () => {
    render(
      <CreateGroupModal
        isModalOpen
        setIsModalOpen={setIsModalOpen}
        reloadData={reloadData}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /create/i,
      }),
    ).toBeDisabled();

    await userEvent.type(
      screen.getByRole('textbox', {
        name: /workspace name/i,
      }),
      '###',
    );

    expect(
      screen.getByRole('button', {
        name: /create/i,
      }),
    ).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', {
        name: /create/i,
      }),
    ); // must change focus for the hint to appear (DDF implementation)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Valid characters include letters, numbers, spaces, hyphens ( - ), and underscores ( _ ).',
        ),
      ).toBeVisible();
    });
  });
});
