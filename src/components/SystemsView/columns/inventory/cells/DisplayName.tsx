import React from 'react';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { ConversionPopover } from '../../../../InventoryTable/ConversionPopover/ConversionPopover';
import { Flex, FlexItem, Icon, Popover } from '@patternfly/react-core';
import { BundleIcon } from '@patternfly/react-icons';
import FontAwesomeImageIcon from '../../../../FontAwesomeImageIcon';
import CellValue from '../../CellValue';

export type DisplayNameValue = {
  id?: string;
  displayName: string | null | undefined;
  isImageBased?: boolean;
  isCentosLinux?: boolean;
};

interface DisplayNameProps {
  value: DisplayNameValue;
}

const DisplayName = ({ value }: DisplayNameProps) => {
  if (value.displayName === null || value.displayName === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Display name data is not available for this system"
      />
    );
  }

  const displayNameContent =
    value.id !== null && value.id !== undefined ? (
      <InsightsLink app="inventory" to={value.id} preview={false}>
        {value.displayName}
      </InsightsLink>
    ) : (
      value.displayName
    );

  const displayNameValue = (
    <div className="ins-composed-col sentry-mask data-hj-suppress">
      <div key="data">
        <Flex gap={{ default: 'gapSm' }}>
          <FlexItem>
            {value.isImageBased ? (
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
          <FlexItem>{displayNameContent}</FlexItem>
          <FlexItem>{value.isCentosLinux && <ConversionPopover />}</FlexItem>
        </Flex>
      </div>
    </div>
  );

  return <CellValue type="present" value={displayNameValue} />;
};

export default DisplayName;
