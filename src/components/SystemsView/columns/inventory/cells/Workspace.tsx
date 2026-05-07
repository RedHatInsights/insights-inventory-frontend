import { NOT_AVAILABLE } from '../../../../../constants';
import { UNGROUPED_ID } from '../../../filters/WorkspaceFilter';
import { System } from '../../../hooks/useSystemsQuery';

interface WorkspaceProps {
  system: System;
}

const Workspace = ({ system }: WorkspaceProps) => {
  const [firstGroup] = system.groups ?? [];

  if (firstGroup === undefined) {
    return NOT_AVAILABLE;
  }

  return (
    firstGroup.name ?? (firstGroup.ungrouped ? UNGROUPED_ID : NOT_AVAILABLE)
  );
};

export default Workspace;
