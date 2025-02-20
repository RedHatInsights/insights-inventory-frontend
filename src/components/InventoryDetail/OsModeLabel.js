import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popover, PopoverPosition } from '@patternfly/react-core';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import { BundleIcon } from '@patternfly/react-icons';

const OsModeLabel = ({ osMode = 'package' }) => {
  const modeContent = {
    image: {
      label: 'RHEL Image mode',
      header: 'Image-based system',
      bodyContent:
        'Image mode for Red Hat Enterprise Linux is a container-native approach \
        that uses the same bits but delivers them as a and the experience is very \
        close to running a containerized application.',
      icon: <FontAwesomeImageIcon />,
    },
    package: {
      label: 'RHEL Package mode',
      header: 'Package-based system',
      bodyContent:
        'Package mode is a familiar RHEL experience across any footprint where \
        the OS is assembled and updated from rpm packages. This is traditionally \
        how RHEL is deployed and will remain the preferred method for many.',
      icon: <BundleIcon />,
    },
  };

  return (
    <Popover
      triggerAction="hover"
      position={PopoverPosition.right}
      headerContent={modeContent[osMode].header}
      bodyContent={<div>{modeContent[osMode].bodyContent}</div>}
    >
      <Label icon={<Icon>{modeContent[osMode].icon}</Icon>}>
        {modeContent[osMode].label}
      </Label>
    </Popover>
  );
};

OsModeLabel.propTypes = {
  osMode: PropTypes.oneOf(['package', 'image']),
};

export default OsModeLabel;
