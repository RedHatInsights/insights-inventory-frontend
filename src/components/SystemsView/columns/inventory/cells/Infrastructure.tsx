import React from 'react';
import CellValue from '../../CellValue';

type TemporaryInfrastructureValue = string | undefined;

interface InfrastructureProps {
  value: TemporaryInfrastructureValue;
}

const Infrastructure = ({ value }: InfrastructureProps) => {
  if (value === undefined || value === '') {
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
