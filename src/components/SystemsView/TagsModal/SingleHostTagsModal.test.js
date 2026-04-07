import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TAGS_SAMPLE } from './__fixtures__/tags';
import { SingleHostTagsModal } from './SingleHostTagsModal';

function minimalSystem(overrides = {}) {
  return {
    id: 'host-1',
    display_name: 'My system',
    tags: [],
    ...overrides,
  };
}

describe('SingleHostTagsModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows title with display_name and tag count', () => {
    const system = minimalSystem({
      display_name: 'Production host',
      tags: TAGS_SAMPLE,
    });
    render(
      <SingleHostTagsModal isOpen system={system} onClose={mockOnClose} />,
    );
    expect(
      screen.getByRole('heading', { name: 'Production host (2)' }),
    ).toBeInTheDocument();
  });

  it('renders Close footer without Apply', async () => {
    const user = userEvent.setup();
    const system = minimalSystem();
    render(
      <SingleHostTagsModal isOpen system={system} onClose={mockOnClose} />,
    );
    expect(
      screen.queryByRole('button', { name: 'Apply' }),
    ).not.toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    const footerClose = closeButtons.find((b) =>
      b.className.includes('pf-m-primary'),
    );
    expect(footerClose).toBeDefined();
    await user.click(footerClose);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show modal when isOpen is false', () => {
    render(
      <SingleHostTagsModal
        isOpen={false}
        system={minimalSystem({ display_name: 'X' })}
        onClose={mockOnClose}
      />,
    );
    expect(
      screen.queryByRole('heading', { name: /X/ }),
    ).not.toBeInTheDocument();
  });
});
