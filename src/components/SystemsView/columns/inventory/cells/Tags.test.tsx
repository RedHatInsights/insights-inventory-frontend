import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Tags from './Tags';
import { SystemActionModalsContext } from '../../../SystemActionModalsContext';
import type { System } from '../../../hooks/useSystemsQuery';

const SYSTEM_ID = 'test-system-id';

const mockOpenTagsModal = jest.fn();

const mockContextValue = {
  openDeleteModal: jest.fn(),
  openAddToWorkspaceModal: jest.fn(),
  openRemoveFromWorkspaceModal: jest.fn(),
  openEditModal: jest.fn(),
  openTagsModal: mockOpenTagsModal,
};

function renderTags(system: System) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      <Tags system={system} />
    </SystemActionModalsContext.Provider>,
  );
}

const systemWithTags = {
  id: SYSTEM_ID,
  tags: [{ namespace: 'a', key: 'k', value: 'v' }],
} as unknown as System;

const systemWithoutTags = {
  id: SYSTEM_ID,
} as unknown as System;

const systemWithEmptyTags = {
  id: SYSTEM_ID,
  tags: [],
} as unknown as System;

describe('Tags cell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tag count from system.tags length', () => {
    renderTags(systemWithTags);

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('1');
  });

  it('should show zero when tags are missing or empty', () => {
    const { rerender } = renderTags(systemWithoutTags);

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('0');

    rerender(
      <SystemActionModalsContext.Provider value={mockContextValue}>
        <Tags system={systemWithEmptyTags} />
      </SystemActionModalsContext.Provider>,
    );

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('0');
  });

  it('should call openTagsModal with the system when tag count is clicked', async () => {
    const user = userEvent.setup();
    renderTags(systemWithTags);

    await user.click(screen.getByRole('button', { name: /tag count/i }));

    expect(mockOpenTagsModal).toHaveBeenCalledTimes(1);
    expect(mockOpenTagsModal).toHaveBeenCalledWith([systemWithTags]);
  });
});
