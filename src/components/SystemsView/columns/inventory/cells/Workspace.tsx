import React from 'react';
import CellValue from '../../CellValue';
import { System } from '../../../hooks/useSystemsQuery';

interface WorkspaceProps {
  value: System['groups'] | undefined;
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
    return <CellValue type="notSet" value={firstGroup.name} />;
  }

  return <CellValue type="present" value={firstGroup.name} />;
};

export default Workspace;
