import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { StructuredTag } from '@redhat-cloud-services/host-inventory-client';
import Tags from './Tags';
import { SystemActionModalsContext } from '../../../SystemActionModalsContext';
import type { System } from '../../../../InventoryViews/hooks/useHostsQuery';
import { NOT_AVAILABLE } from '../../CellValue';

const SYSTEM_ID = 'test-system-id';

const mockOpenTagsModal = jest.fn();

const mockContextValue = {
  openDeleteModal: jest.fn(),
  openAddToWorkspaceModal: jest.fn(),
  openRemoveFromWorkspaceModal: jest.fn(),
  openEditModal: jest.fn(),
  openTagsModal: mockOpenTagsModal,
};

function renderTags(value: StructuredTag[] | undefined, system: System) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      <Tags value={value} system={system} />
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

  it('should show tag count from value length', () => {
    renderTags(systemWithTags.tags, systemWithTags);

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('1');
  });

  it(`should show ${NOT_AVAILABLE} when tag data is missing`, () => {
    renderTags(undefined, systemWithoutTags);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should show zero when tags are empty', () => {
    renderTags([], systemWithEmptyTags);

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('0');
  });

  it('should call openTagsModal with the system when tag count is clicked', async () => {
    const user = userEvent.setup();
    renderTags(systemWithTags.tags, systemWithTags);

    await user.click(screen.getByRole('button', { name: /tag count/i }));

    expect(mockOpenTagsModal).toHaveBeenCalledTimes(1);
    expect(mockOpenTagsModal).toHaveBeenCalledWith([systemWithTags]);
  });
});
