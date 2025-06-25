import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Label,
  Popover,
  TextContent,
  Text,
  PopoverPosition,
} from '@patternfly/react-core';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import { BundleIcon } from '@patternfly/react-icons';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

const OsModeLabel = ({ osMode = 'package' }) => {
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter',
  );
  let imageContent;
  let packageContent;
  let imageLabel;
  let packageLabel;
  if (edgeParityFilterDeviceEnabled) {
    imageLabel = 'Image mode';
    packageLabel = 'Package mode';
    imageContent = (
      <TextContent>
        <Text>
          Image mode for Red Hat Enterprise Linux is a container-native approach
          that uses the same bits but delivers them as a container image.
          Updates are immutable and the experience is very close to running a
          containerized application.
        </Text>
      </TextContent>
    );
    packageContent = (
      <TextContent>
        <Text>
          Package mode is a familiar RHEL experience across any footprint where
          the OS is assembled and updated from rpm packages. This is
          traditionally how RHEL is deployed and will remain the preferred
          method for many.
        </Text>
      </TextContent>
    );
  } else {
    imageLabel = 'Image-based';
    packageLabel = 'Package-based';
    imageContent = (
      <TextContent>
        <Text>
          Image mode for Red Hat Enterprise Linux and Immutable (OSTree) are
          version-controlled deployment models that support atomic updates and
          rollbacks.
        </Text>
        <Text>
          Image mode delivers the OS as a container image, while Immutable
          (OSTree) manages it as a versioned file system tree – both providing
          consistency and reliability similar to containerized applications.
        </Text>
      </TextContent>
    );
    packageContent = (
      <TextContent>
        <Text>
          Package-based deployment is a familiar Red Hat Enterprise Linux (RHEL)
          experience across any footprint where the OS is assembled and updated
          from rpm packages. This is traditionally how RHEL is deployed and will
          remain the preferred method for many.
        </Text>
      </TextContent>
    );
  }

  const modeContent = {
    image: {
      label: imageLabel,
      header: 'Image-based system',
      bodyContent: imageContent,
      icon: <FontAwesomeImageIcon />,
    },
    package: {
      label: packageLabel,
      header: 'Package-based system',
      bodyContent: packageContent,
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
