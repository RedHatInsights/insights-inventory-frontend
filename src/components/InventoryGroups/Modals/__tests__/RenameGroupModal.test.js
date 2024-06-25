import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStore } from '../../../../store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import useWorkspaceFeatureFlag from '../../../../Utilities/hooks/useWorkspaceFeatureFlag';
import RenameGroupModal from '../RenameGroupModal';

jest.mock('../../../../Utilities/hooks/useWorkspaceFeatureFlag');

describe('CreateGroupModal', () => {
  beforeEach(() => {
    useWorkspaceFeatureFlag.mockReturnValue(false);
  });

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
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /Rename group/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
  });
});
