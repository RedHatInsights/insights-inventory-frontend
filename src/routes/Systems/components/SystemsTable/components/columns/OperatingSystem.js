import React from 'react';
import OperatingSystemFormatter from '../../../../../../Utilities/OperatingSystemFormatter';

const OperatingSystem = ({ system_profile }) => (
  <OperatingSystemFormatter
    operatingSystem={system_profile?.operating_system}
  />
);

export default OperatingSystem;
