import { NOT_AVAILABLE } from '../../CellValue';
import { UNGROUPED_HOSTS_LABEL } from '../../../constants';
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
    firstGroup.name ??
    (firstGroup.ungrouped ? UNGROUPED_HOSTS_LABEL : NOT_AVAILABLE)
  );
};

export default Workspace;
