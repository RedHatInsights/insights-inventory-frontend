import React from 'react';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import CellValue from '../../CellValue';

export type CreatedValue = string | Date | undefined;

interface CreatedProps {
  value: CreatedValue;
}

const Created = ({ value }: CreatedProps) => {
  if (value === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Created date is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={<DateFormat date={value} />} />;
};

export default Created;
