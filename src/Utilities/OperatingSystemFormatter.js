import React from 'react';
import PropTypes from 'prop-types';

const OperatingSystemFormatter = ({ operatingSystem }) => {
  if (
    operatingSystem?.name === 'RHEL' ||
    operatingSystem?.name === 'CentOS Linux'
  ) {
    const version =
      (operatingSystem.major &&
        operatingSystem.minor !== null &&
        `${operatingSystem.major}.${operatingSystem?.minor}`) ||
      null;

    return (
      <span aria-label="Formatted OS version">
        {operatingSystem.name} {version}
      </span>
    );
  }

  return (
    <span aria-label="Formatted OS version">
      {operatingSystem?.name || 'Not available'}
    </span>
  );
};

OperatingSystemFormatter.propTypes = {
  operatingSystem: PropTypes.shape({
    name: PropTypes.string,
    major: PropTypes.number,
    minor: PropTypes.number,
  }),
};

export default OperatingSystemFormatter;
