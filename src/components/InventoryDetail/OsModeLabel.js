import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popover, PopoverPosition } from '@patternfly/react-core';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import { BundleIcon } from '@patternfly/react-icons';
import { systemTypeContent } from '../../Utilities/constants';

const OsModeLabel = ({ osMode = 'package' }) => {
  const modeContent = {
    image: {
      label: systemTypeContent.imageLabel,
      header: 'Image-based system',
      bodyContent: systemTypeContent.imageContent,
      icon: <FontAwesomeImageIcon />,
    },
    package: {
      label: systemTypeContent.packageLabel,
      header: 'Package-based system',
      bodyContent: systemTypeContent.packageContent,
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
