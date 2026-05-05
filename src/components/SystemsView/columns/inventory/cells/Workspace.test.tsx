import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Workspace from './Workspace';
import { UNGROUPED_ID } from '../../../filters/WorkspaceFilter';
import type { System } from '../../../hooks/useSystemsQuery';

const SYSTEM_ID = 'test-system-id';

const systemWithoutGroups = {
  id: SYSTEM_ID,
} as unknown as System;

const systemWithEmptyGroups = {
  id: SYSTEM_ID,
  groups: [],
} as unknown as System;

const systemWithNamedWorkspace = {
  id: SYSTEM_ID,
  groups: [{ name: 'Production' }],
} as unknown as System;

const systemWithUngroupedFlag = {
  id: SYSTEM_ID,
  groups: [{ ungrouped: true }],
} as unknown as System;

describe('Workspace cell', () => {
  it('should show the first workspace name when present', () => {
    render(<Workspace system={systemWithNamedWorkspace} />);

    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('should show ungrouped label when system has no groups', () => {
    const { rerender } = render(<Workspace system={systemWithoutGroups} />);

    expect(screen.getByText(UNGROUPED_ID)).toBeInTheDocument();

    rerender(<Workspace system={systemWithEmptyGroups} />);

    expect(screen.getByText(UNGROUPED_ID)).toBeInTheDocument();
  });

  it('should show ungrouped label when first group is ungrouped', () => {
    render(<Workspace system={systemWithUngroupedFlag} />);

    expect(screen.getByText(UNGROUPED_ID)).toBeInTheDocument();
  });
});
