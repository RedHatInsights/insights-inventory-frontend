import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GroupDetailHeader from '../GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import userEvent from '@testing-library/user-event';

jest.mock('../../../Utilities/useFeatureFlag');
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual('react-redux'),
    useSelector: () => ({
      uninitialized: false,
      loading: false,
      data: {
        results: [
          {
            name: 'group-name-1',
          },
        ],
      },
    }),
    useDispatch: () => {},
  };
});

jest.mock('@redhat-cloud-services/frontend-components-utilities/RBACHook');

describe('group detail header', () => {
  usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));

  it('renders title', () => {
    render(
      <MemoryRouter>
        <GroupDetailHeader groupId="group-id-2" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('renders the actions dropdown', async () => {
    render(
      <MemoryRouter>
        <GroupDetailHeader groupId="group-id-2" />
      </MemoryRouter>,
    );

    screen.getByRole('button', {
      name: /actions/i,
    });

    await userEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      }),
    );

    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    expect(
      screen.getByRole('menuitem', {
        name: /rename/i,
      }),
    ).toBeVisible();

    expect(
      screen.getByRole('menuitem', {
        name: /delete/i,
      }),
    ).toBeVisible();
  });
});
