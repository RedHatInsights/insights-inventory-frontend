import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TagsModal } from './TagsModal';
import { TAGS_100 } from './__fixtures__/tags';

const defaultSystem = {
  display_name: 'test-system.example.com',
  tags: TAGS_100,
};

describe('TagsModal', () => {
  it('should render system name and tag count in title', () => {
    const onClose = jest.fn();
    render(<TagsModal isOpen system={defaultSystem} onClose={onClose} />);

    expect(
      screen.getByRole('heading', { name: /test-system.example.com \(100\)/ }),
    ).toBeInTheDocument();
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('should call onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<TagsModal isOpen system={defaultSystem} onClose={onClose} />);

    // "Close" and X buttons
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await user.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
