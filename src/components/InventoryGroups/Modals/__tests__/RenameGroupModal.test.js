import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import RenameGroupModal from '../RenameGroupModal';
import { validateGroupName } from '../../utils/api';

jest.mock('../../utils/api');

describe('CreateGroupModal', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Provider store={getStore()}>
          <RenameGroupModal
            isModalOpen={true}
            reloadData={() => console.log('data reloaded')}
            modalState={{ id: '1', name: 'sre-group' }}
          />
        </Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /Rename workspace/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
  });

  it('revalidates a duplicate name after an intervening rename value', async () => {
    const validationRequests = {};
    validateGroupName.mockImplementation(
      (value) =>
        new Promise((resolve) => {
          validationRequests[value] ??= [];
          validationRequests[value].push(resolve);
        }),
    );

    render(
      <MemoryRouter>
        <Provider store={getStore()}>
          <RenameGroupModal
            isModalOpen
            reloadData={jest.fn()}
            modalState={{ id: '1', name: 'original' }}
          />
        </Provider>
      </MemoryRouter>,
    );

    const nameInput = screen.getByRole('textbox');
    const saveButton = screen.getByRole('button', { name: /Save/ });

    fireEvent.change(nameInput, { target: { value: 'duplicate' } });
    await waitFor(() =>
      expect(validateGroupName).toHaveBeenCalledWith('duplicate'),
    );

    fireEvent.change(nameInput, { target: { value: 'valid-new-name' } });
    await waitFor(() =>
      expect(validateGroupName).toHaveBeenCalledWith('valid-new-name'),
    );
    validationRequests['valid-new-name'][0](false);
    validationRequests.duplicate[0](true);
    await waitFor(() => expect(saveButton).toBeEnabled());

    fireEvent.change(nameInput, { target: { value: 'duplicate' } });
    await waitFor(() => expect(validationRequests.duplicate).toHaveLength(2));

    validationRequests.duplicate[1](true);
    await waitFor(() => expect(saveButton).toBeDisabled());
  });
});
