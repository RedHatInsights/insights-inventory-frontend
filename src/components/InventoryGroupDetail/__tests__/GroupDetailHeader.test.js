import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GroupDetailHeader from '../GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

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

  it('renders title and breadcrumbs', () => {
    render(
      <MemoryRouter>
        <GroupDetailHeader groupId="group-id-2" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('has breadcrumbs', () => {
    render(
      <MemoryRouter>
        <GroupDetailHeader groupId="group-id-2" />
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation')).toHaveClass('pf-c-breadcrumb');
    expect(screen.getByRole('navigation')).toHaveTextContent('group-name-1');
  });

  it('renders the actions dropdown', () => {
    render(
      <MemoryRouter>
        <GroupDetailHeader groupId="group-id-2" />
      </MemoryRouter>
    );

    screen.getByRole('button', {
      name: /group actions/i,
    });
  });
});
