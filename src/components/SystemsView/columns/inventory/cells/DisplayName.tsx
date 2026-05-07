import React from 'react';
import { Link } from 'react-router-dom';
import { ConversionPopover } from '../../../../InventoryTable/ConversionPopover/ConversionPopover';
import { Flex, FlexItem, Icon, Popover } from '@patternfly/react-core';
import { BundleIcon } from '@patternfly/react-icons';
import FontAwesomeImageIcon from '../../../../FontAwesomeImageIcon';
import type { System } from '../../../hooks/useSystemsQuery';

const isImageBasedSystem = (system: System) =>
  system?.system_profile?.bootc_status?.booted?.image_digest ||
  system?.system_profile?.host_type === 'edge';

const isCentosLinuxSystem = (system: System) =>
  system?.system_profile?.operating_system?.name === 'CentOS Linux';

interface DisplayNameProps {
  system: System;
}

const DisplayName = ({ system }: DisplayNameProps) => {
  return (
    <div className="ins-composed-col sentry-mask data-hj-suppress">
      <div key="data">
        <Flex gap={{ default: 'gapSm' }}>
          <FlexItem>
            {isImageBasedSystem(system) ? (
              <Popover
                triggerAction="hover"
                headerContent="Image-based system"
                bodyContent={
                  <div>
                    Image mode for Red Hat Enterprise Linux is a
                    container-native approach that uses the same bits but
                    delivers them as a container image. Updates are immutable
                    and the experience is very close to running a containerized
                    application.
                  </div>
                }
              >
                <Icon aria-label="Image mode icon">
                  <FontAwesomeImageIcon
                    fill="var(--pf-t--global--icon--color--subtle)"
                    margin="0px"
                  />
                </Icon>
              </Popover>
            ) : (
              <Popover
                triggerAction="hover"
                headerContent="Package-based system"
                bodyContent={
                  <div>
                    Package mode is a familiar RHEL experience across any
                    footprint where the OS is assembled and updated from rpm
                    packages. This is traditionally how RHEL is deployed and
                    will remain the preferred method for many.
                  </div>
                }
              >
                <Icon aria-label="Package mode icon">
                  <BundleIcon color="var(--pf-t--global--icon--color--subtle)" />
                </Icon>
              </Popover>
            )}
          </FlexItem>
          <FlexItem>
            <Link to={system.id || ''}>{system.display_name}</Link>
          </FlexItem>
          <FlexItem>
            {isCentosLinuxSystem(system) && <ConversionPopover />}
          </FlexItem>
        </Flex>
      </div>
    </div>
  );
};

export default DisplayName;
