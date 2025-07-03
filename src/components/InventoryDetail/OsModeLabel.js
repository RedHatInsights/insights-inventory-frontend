import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Label, Popover, PopoverPosition } from '@patternfly/react-core';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import { BundleIcon } from '@patternfly/react-icons';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { systemTypeContent } from '../../Utilities/constants';

const OsModeLabel = ({ osMode = 'package' }) => {
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter',
  );
  const modeContent = {
    image: {
      label: systemTypeContent[edgeParityFilterDeviceEnabled]?.imageLabel,
      header: 'Image-based system',
      bodyContent:
        systemTypeContent[edgeParityFilterDeviceEnabled]?.imageContent,
      icon: <FontAwesomeImageIcon />,
    },
    package: {
      label: systemTypeContent[edgeParityFilterDeviceEnabled]?.packageLabel,
      header: 'Package-based system',
      bodyContent:
        systemTypeContent[edgeParityFilterDeviceEnabled]?.packageContent,
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
