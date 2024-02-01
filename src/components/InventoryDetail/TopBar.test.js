import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TestWrapper } from '../../Utilities/TestingUtilities';
import TopBar from './TopBar';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate'
);

describe('TopBar', () => {
  const entity = { id: 42 };

  it('dropdown has link to inventory', async () => {
    const navigateMocked = jest.fn();
    useInsightsNavigate.mockImplementation(() => navigateMocked);

    render(
      <TestWrapper>
        <TopBar entity={entity} loaded />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      })
    );
    await userEvent.click(
      screen.getByRole('menuitem', {
        name: /view system in inventory/i,
      })
    );

    expect(navigateMocked).toBeCalled();
  });

  it('dropdown hides link to inventory', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded hideInvLink />
      </TestWrapper>
    );

    expect(
      screen.queryByRole('button', {
        name: /actions/i,
      })
    ).not.toBeInTheDocument();
  });

  it('renders custom action', async () => {
    const onClick = jest.fn();
    render(
      <TestWrapper>
        <TopBar
          entity={entity}
          loaded
          actions={[{ title: 'title', onClick }]}
        />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      })
    );
    screen.getByRole('menuitem', {
      name: /view system in inventory/i,
    });
    await userEvent.click(
      screen.getByRole('menuitem', {
        name: /title/i,
      })
    );
    expect(onClick).toBeCalled();
  });

  it('renders skeleton when loading', () => {
    render(
      <TestWrapper>
        <TopBar />
      </TestWrapper>
    );

    expect(
      screen.queryByRole('button', {
        name: /actions/i,
      })
    ).not.toBeInTheDocument();
  });

  it('shows delete button by default', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded showDelete />
      </TestWrapper>
    );

    expect(
      screen.getByRole('button', {
        name: /delete/i,
      })
    ).toHaveAttribute('aria-disabled', 'false');
  });

  it('disables delete button', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded showDelete={false} />
      </TestWrapper>
    );

    expect(
      screen.getByRole('button', {
        name: /delete/i,
      })
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
