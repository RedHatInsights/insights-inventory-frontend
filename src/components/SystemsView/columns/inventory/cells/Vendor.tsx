import React from 'react';
import CellValue from '../../CellValue';

interface VendorProps {
  value: string | null | undefined;
}

const Vendor = ({ value }: VendorProps) => {
  if (value == null || value === '') {
    return (
      <CellValue
        type="notAvailable"
        reason="Vendor data is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={value} />;
};

export default Vendor;
