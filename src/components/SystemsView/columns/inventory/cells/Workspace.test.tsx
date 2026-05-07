import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Workspace from './Workspace';
import { UNGROUPED_ID } from '../../../filters/WorkspaceFilter';
import type { System } from '../../../hooks/useSystemsQuery';

const SYSTEM_ID = 'test-system-id';

const systemWithNamedWorkspace = {
  id: SYSTEM_ID,
  groups: [{ name: 'Production' }],
} as unknown as System;

describe('Workspace cell', () => {
  it('should show the first workspace name when present', () => {
    render(<Workspace system={systemWithNamedWorkspace} />);

    expect(screen.getByText('Production')).toBeInTheDocument();
  });
});
