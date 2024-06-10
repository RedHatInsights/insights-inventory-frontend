import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { getStore } from '../../../store';
import NoGroupsEmptyState from '../NoGroupsEmptyState';
import useWorkspaceFeatureFlag from '../../../Utilities/hooks/useWorkspaceFeatureFlag';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);

jest.mock('../../../Utilities/hooks/useWorkspaceFeatureFlag');

describe('NoGroupsEmptyState', () => {
  beforeEach(() => {
    useWorkspaceFeatureFlag.mockReturnValue(false);
  });

  it('renders title and icon', () => {
    render(
      <TestWrapper store={getStore()}>
        <NoGroupsEmptyState />
      </TestWrapper>
    );

    screen.getByRole('heading', {
      name: /no inventory groups/i,
    });
    screen.getByTestId('no-groups-icon');
  });

  it('renders create group button', async () => {
    const onCreateGroupClick = jest.fn();
    render(
      <TestWrapper store={getStore()}>
        <NoGroupsEmptyState onCreateGroupClick={onCreateGroupClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /create group/i,
      })
    );
    expect(onCreateGroupClick).toBeCalled();
  });
});
