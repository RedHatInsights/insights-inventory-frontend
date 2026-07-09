import React from 'react';
import CellValue from '../../CellValue';
import type { GroupOut } from '@redhat-cloud-services/host-inventory-client';

interface WorkspaceProps {
  value: GroupOut[] | undefined;
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
