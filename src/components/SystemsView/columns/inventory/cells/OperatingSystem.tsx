import React from 'react';
import type { SystemProfileOperatingSystem } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';

interface OperatingSystemProps {
  value: SystemProfileOperatingSystem | undefined;
}

const formatOperatingSystem = (
  operatingSystem: SystemProfileOperatingSystem,
): string => {
  if (
    operatingSystem.name === 'RHEL' ||
    operatingSystem.name === 'CentOS Linux'
  ) {
    const { name, major, minor } = operatingSystem;
    const hasVersion = typeof major === 'number' && typeof minor === 'number';

    return hasVersion ? `${name} ${major}.${minor}` : name;
  }

  return operatingSystem.name;
};

const OperatingSystem = ({ value }: OperatingSystemProps) => {
  if (value == null || value.name == null) {
    return (
      <CellValue
        type="notAvailable"
        reason="Operating system data is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={formatOperatingSystem(value)} />;
};

export default OperatingSystem;
