import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { TestWrapper } from '../../Utilities/TestingUtilities';
import TopBar from './TopBar';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate',
);

const CurrentPath = () => {
  const { pathname } = useLocation();
  return <span data-testid="current-path">{pathname}</span>;
};

describe('TopBar', () => {
  const entity = { id: 42 };

  it('dropdown has link to inventory', async () => {
    const navigateMocked = jest.fn();
    useInsightsNavigate.mockImplementation(() => navigateMocked);

    render(
      <TestWrapper>
        <TopBar entity={entity} loaded />
      </TestWrapper>,
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      }),
    );
    await userEvent.click(
      screen.getByRole('menuitem', {
        name: /view system in inventory/i,
      }),
    );

    expect(navigateMocked).toHaveBeenCalled();
  });

  it('dropdown hides link to inventory', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded hideInvLink />
      </TestWrapper>,
    );

    expect(
      screen.queryByRole('button', {
        name: /actions/i,
      }),
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
      </TestWrapper>,
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      }),
    );
    screen.getByRole('menuitem', {
      name: /view system in inventory/i,
    });
    await userEvent.click(
      screen.getByRole('menuitem', {
        name: /title/i,
      }),
    );
    expect(onClick).toHaveBeenCalled();
  });

  it('renders skeleton when loading', () => {
    render(
      <TestWrapper>
        <TopBar />
      </TestWrapper>,
    );

    expect(
      screen.queryByRole('button', {
        name: /actions/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('shows delete button in the inventory app', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded showDelete isInventoryApp />
      </TestWrapper>,
    );

    expect(
      screen.getByRole('button', {
        name: /delete/i,
      }),
    ).not.toHaveAttribute('aria-disabled');
  });

  it('navigates to the inventory list after successful delete without a callback', async () => {
    const navigateToInventory = jest.fn();
    const previousHistoryState = window.history.state;
    window.history.replaceState({ idx: 1 }, '', window.location.href);
    useInsightsNavigate.mockImplementation(() => navigateToInventory);

    render(
      <TestWrapper routerProps={{ initialEntries: ['/', '/system-1'] }}>
        <>
          <TopBar
            entity={{ id: 'system-1', display_name: 'system-1' }}
            loaded
            showDelete
            isInventoryApp
            deleteEntity={(_systems, _name, onSuccess) => onSuccess()}
          />
          <CurrentPath />
        </>
      </TestWrapper>,
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByTestId('confirm-inventory-delete'));

    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    expect(navigateToInventory).not.toHaveBeenCalled();
    window.history.replaceState(previousHistoryState, '', window.location.href);
  });

  it('uses the inventory list as fallback when there is no previous history entry', async () => {
    const navigateToInventory = jest.fn();
    const previousHistoryState = window.history.state;
    window.history.replaceState({ idx: 0 }, '', window.location.href);
    useInsightsNavigate.mockImplementation(() => navigateToInventory);

    render(
      <TestWrapper routerProps={{ initialEntries: ['/system-1'] }}>
        <TopBar
          entity={{ id: 'system-1', display_name: 'system-1' }}
          loaded
          showDelete
          isInventoryApp
          deleteEntity={(_systems, _name, onSuccess) => onSuccess()}
        />
      </TestWrapper>,
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByTestId('confirm-inventory-delete'));

    expect(navigateToInventory).toHaveBeenCalledWith('/');
    window.history.replaceState(previousHistoryState, '', window.location.href);
  });

  it('does not redirect if the browser navigates elsewhere before delete completes', async () => {
    let completeDelete;
    const originalPath = window.location.pathname;
    useInsightsNavigate.mockImplementation(() => jest.fn());

    render(
      <TestWrapper routerProps={{ initialEntries: ['/system-1'] }}>
        <>
          <TopBar
            entity={{ id: 'system-1', display_name: 'system-1' }}
            loaded
            showDelete
            isInventoryApp
            deleteEntity={(_systems, _name, onSuccess) => {
              completeDelete = onSuccess;
            }}
          />
          <CurrentPath />
        </>
      </TestWrapper>,
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByTestId('confirm-inventory-delete'));
    // The guard reads window.location because the app router may be basename-scoped.
    window.history.pushState({}, '', '/another-page');
    completeDelete();

    expect(screen.getByTestId('current-path')).toHaveTextContent('/system-1');
    window.history.pushState({}, '', originalPath);
  });

  it('returns to the list when a delayed delete succeeds', async () => {
    let completeDelete;
    const previousHistoryState = window.history.state;
    window.history.replaceState({ idx: 1 }, '', window.location.href);
    useInsightsNavigate.mockImplementation(() => jest.fn());

    render(
      <TestWrapper routerProps={{ initialEntries: ['/', '/system-1'] }}>
        <>
          <TopBar
            entity={{ id: 'system-1', display_name: 'system-1' }}
            loaded
            showDelete
            isInventoryApp
            deleteEntity={(_systems, _name, onSuccess) => {
              completeDelete = onSuccess;
            }}
          />
          <CurrentPath />
        </>
      </TestWrapper>,
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByTestId('confirm-inventory-delete'));
    completeDelete();

    expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    window.history.replaceState(previousHistoryState, '', window.location.href);
  });

  it('disables delete button', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded showDelete={false} isInventoryApp />
      </TestWrapper>,
    );

    expect(
      screen.getByRole('button', {
        name: /delete/i,
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not render delete button outside the inventory app', () => {
    render(
      <TestWrapper>
        <TopBar entity={entity} loaded showDelete />
      </TestWrapper>,
    );

    expect(
      screen.queryByRole('button', {
        name: /delete/i,
      }),
    ).not.toBeInTheDocument();
  });
});
