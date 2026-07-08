import React from 'react';
import CellValue from '../../CellValue';
import { UNGROUPED_HOSTS_LABEL } from '../../../constants';

interface WorkspaceGroup {
  name?: string | null;
  ungrouped?: boolean;
}

interface WorkspaceProps {
  value: WorkspaceGroup[] | undefined;
}

const Workspace = ({ value }: WorkspaceProps) => {
  const [firstGroup] = value ?? [];

  if (firstGroup === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Workspace data is not available for this system"
      />
    );
  }

  if (firstGroup.ungrouped) {
    return <CellValue type="notSet" value={UNGROUPED_HOSTS_LABEL} />;
  }

  if (firstGroup.name != null && firstGroup.name !== '') {
    return <CellValue type="present" value={firstGroup.name} />;
  }

  return (
    <CellValue
      type="notAvailable"
      reason="Workspace name is not available for this system"
    />
  );
};

export default Workspace;
