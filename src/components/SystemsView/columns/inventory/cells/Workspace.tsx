import React from 'react';
import CellValue from '../../CellValue';

export type WorkspaceValue = ReadonlyArray<{
  id?: string;
  name?: string | null;
}>;

interface WorkspaceProps {
  value: WorkspaceValue | undefined;
}

const Workspace = ({ value }: WorkspaceProps) => {
  const [firstGroup] = value ?? [];

  if (firstGroup === undefined || !firstGroup.name) {
    return (
      <CellValue
        type="notAvailable"
        reason="Workspace data is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={firstGroup.name} />;
};

export default Workspace;
