import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HostStalenessResetPopover from './HostStalenessResetPopover';

const user = userEvent.setup();

describe('HostStalenessResetPopover', () => {
  it('renders trigger button', () => {
    render(<HostStalenessResetPopover />);

    expect(
      screen.getByRole('button', { name: /reset to system default/i }),
    ).toBeVisible();
  });

  it('opens popover with auto-width and displays default settings content', async () => {
    render(<HostStalenessResetPopover />);

    const triggerButton = screen.getByRole('button', {
      name: /reset to system default/i,
    });
    await user.click(triggerButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeVisible();
    expect(dialog).toHaveClass('pf-m-width-auto');
    expect(screen.getByText('Default settings')).toBeVisible();
    expect(
      screen.getByText(
        '- Systems are marked as stale after 1 day since last check-in.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        '- Systems are marked as stale warning after 7 days since last check-in.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        '- Systems are deleted after 30 days since last check-in.',
      ),
    ).toBeVisible();
  });
});
