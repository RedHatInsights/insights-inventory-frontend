import React from 'react';
import OperatingSystemFormatter from '../../../../../Utilities/OperatingSystemFormatter';
import { System } from '../../../hooks/useSystemsQuery';

interface OperatingSystemProps {
  system: System;
}

const OperatingSystem = ({ system }: OperatingSystemProps) => (
  <OperatingSystemFormatter
    operatingSystem={system.system_profile?.operating_system}
  />
);

export default OperatingSystem;
