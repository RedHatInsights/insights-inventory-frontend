import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { StructuredTag } from '@redhat-cloud-services/host-inventory-client';
import Tags, { type TagsValue } from './Tags';
import { SystemActionModalsContext } from '../../../SystemActionModalsContext';
import { NOT_AVAILABLE } from '../../CellValue';

const SYSTEM_ID = 'test-system-id';

const mockOpenTagsModal = jest.fn();

const mockContextValue = {
  openDeleteModal: jest.fn(),
  openAddToWorkspaceModal: jest.fn(),
  openMoveSystemsToWorkspaceModal: jest.fn(),
  openRemoveFromWorkspaceModal: jest.fn(),
  openEditModal: jest.fn(),
  openTagsModal: mockOpenTagsModal,
};

function renderTags(value: TagsValue) {
  return render(
    <SystemActionModalsContext.Provider value={mockContextValue}>
      <Tags value={value} />
    </SystemActionModalsContext.Provider>,
  );
}

const tags: StructuredTag[] = [{ namespace: 'a', key: 'k', value: 'v' }];

describe('Tags cell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show tag count from value length', () => {
    renderTags({ id: SYSTEM_ID, tags });

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('1');
  });

  it(`should show ${NOT_AVAILABLE} when tag data is missing`, () => {
    renderTags({ id: SYSTEM_ID });

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should show zero when tags are empty', () => {
    renderTags({ id: SYSTEM_ID, tags: [] });

    expect(
      screen.getByRole('button', { name: /tag count/i }),
    ).toHaveTextContent('0');
  });

  it('should call openTagsModal with a host id when tag count is clicked', async () => {
    const user = userEvent.setup();
    renderTags({ id: SYSTEM_ID, tags });

    await user.click(screen.getByRole('button', { name: /tag count/i }));

    expect(mockOpenTagsModal).toHaveBeenCalledTimes(1);
    expect(mockOpenTagsModal).toHaveBeenCalledWith([
      expect.objectContaining({ id: SYSTEM_ID, tags }),
    ]);
  });
});
