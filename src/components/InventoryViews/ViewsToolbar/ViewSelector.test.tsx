import '@testing-library/jest-dom';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ViewSelector from './ViewSelector';
import { ALL_SYSTEMS_VIEW_ID } from '../../../api/inventoryViewsApi';
import { MOCK_VIEWS } from './__mocks__/views';

const defaultProps = {
  views: MOCK_VIEWS,
  activeViewId: ALL_SYSTEMS_VIEW_ID,
  onSelectView: jest.fn(),
};

function renderViewSelector(props = {}) {
  return render(<ViewSelector {...defaultProps} {...props} />);
}

describe('ViewSelector', () => {
  it('should render the active view name in the toggle', () => {
    renderViewSelector();

    expect(screen.getByPlaceholderText('All systems')).toBeInTheDocument();
  });

  it('should show dropdown options when clicked', async () => {
    const user = userEvent.setup();
    renderViewSelector();

    await user.click(screen.getByRole('textbox'));

    const listbox = screen.getByRole('listbox');
    for (const view of MOCK_VIEWS) {
      expect(within(listbox).getByText(view.name)).toBeInTheDocument();
    }
  });

  it('should call onSelectView when a view is selected', async () => {
    const user = userEvent.setup();
    const onSelectView = jest.fn();
    renderViewSelector({ onSelectView });

    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByText('Production view'));

    expect(onSelectView).toHaveBeenCalledWith('view-production');
  });

  it('should close the dropdown after selection', async () => {
    const user = userEvent.setup();
    renderViewSelector();

    const toggle = screen.getByRole('button', { name: 'Menu toggle' });
    await user.click(screen.getByRole('textbox'));
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByText('Production view'));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('should show the selected view name in the toggle', () => {
    renderViewSelector({ activeViewId: 'view-production' });

    expect(screen.getByPlaceholderText('Production view')).toBeInTheDocument();
  });

  it('should render dividers between sections', async () => {
    const user = userEvent.setup();
    renderViewSelector();

    await user.click(screen.getByRole('textbox'));

    const dividers = screen.getAllByRole('separator');
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });

  it('should show System badge for system views', async () => {
    const user = userEvent.setup();
    renderViewSelector();

    await user.click(screen.getByRole('textbox'));

    const systemLabels = screen.getAllByText('System');
    expect(systemLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('should filter views based on search input', async () => {
    const user = userEvent.setup();
    renderViewSelector();

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);
    await user.type(searchInput, 'Production');

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Production view')).toBeInTheDocument();
      expect(within(listbox).queryByText('Staging')).not.toBeInTheDocument();
    });
  });

  it('should show "No matching views" when search returns no results', async () => {
    const user = userEvent.setup();
    renderViewSelector();

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);
    await user.type(searchInput, 'NonexistentView');

    await waitFor(() => {
      expect(screen.getByText('No matching views')).toBeInTheDocument();
    });
  });
});
