import { UNGROUPED_ID } from '../../../filters/WorkspaceFilter';
import { System } from '../../../hooks/useSystemsQuery';

interface WorkspaceProps {
  system: System;
}

const Workspace = ({ system }: WorkspaceProps) => {
  const [firstGroup] = system.groups ?? [];

  if (firstGroup === undefined) {
    return UNGROUPED_ID;
  }

  return firstGroup.name ?? (firstGroup.ungrouped ? UNGROUPED_ID : '');
};

export default Workspace;
