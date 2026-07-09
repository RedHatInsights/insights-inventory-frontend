import React from 'react';
import CellValue from '../../CellValue';

type TemporaryVendorValue = string | undefined;

interface VendorProps {
  value: TemporaryVendorValue;
}

const Vendor = ({ value }: VendorProps) => {
  if (value === undefined || value === '') {
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
