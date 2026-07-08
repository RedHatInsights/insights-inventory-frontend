import React from 'react';
import CellValue from '../../CellValue';

interface InfrastructureProps {
  value: string | null | undefined;
}

const Infrastructure = ({ value }: InfrastructureProps) => {
  if (value == null || value === '') {
    return (
      <CellValue
        type="notAvailable"
        reason="Infrastructure data is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={value} />;
};

export default Infrastructure;
