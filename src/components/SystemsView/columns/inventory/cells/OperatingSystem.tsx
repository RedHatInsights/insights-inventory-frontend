import React from 'react';
import CellValue from '../../CellValue';

export type OperatingSystemValue = {
  name?: string;
  major?: number;
  minor?: number;
  rhsm?: string;
};

interface OperatingSystemProps {
  value: OperatingSystemValue | undefined;
}

const formatOperatingSystem = (
  operatingSystem: OperatingSystemValue,
): string | undefined => {
  if (!operatingSystem.name) {
    return operatingSystem.rhsm;
  }

  if (
    operatingSystem.name === 'RHEL' ||
    operatingSystem.name === 'CentOS Linux' ||
    operatingSystem.name === 'CentOS'
  ) {
    const { name, major, minor } = operatingSystem;
    const hasVersion = typeof major === 'number' && typeof minor === 'number';

    return hasVersion ? `${name} ${major}.${minor}` : name;
  }

  return operatingSystem.name;
};

const OperatingSystem = ({ value }: OperatingSystemProps) => {
  const formatted = value ? formatOperatingSystem(value) : undefined;

  if (formatted === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Operating system data is not available for this system"
      />
    );
  }

  return (
    <CellValue
      type="present"
      value={<span aria-label="Formatted OS version">{formatted}</span>}
    />
  );
};

export default OperatingSystem;
