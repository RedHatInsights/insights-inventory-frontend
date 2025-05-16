import React from 'react';
import OperatingSystemFormatter from '../../../../../../Utilities/OperatingSystemFormatter';
import PropTypes from 'prop-types';

const OperatingSystem = ({ system_profile }) => (
  <OperatingSystemFormatter
    operatingSystem={system_profile?.operating_system}
  />
);

OperatingSystem.propTypes = {
  system_profile: PropTypes.shape({
    operating_system: PropTypes.object,
  }),
};

export default OperatingSystem;
