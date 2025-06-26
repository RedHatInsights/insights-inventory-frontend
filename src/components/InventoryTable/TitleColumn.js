/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import { ConversionPopover } from './ConversionPopover/ConversionPopover';
import { Icon, Popover, Text, TextContent } from '@patternfly/react-core';
import { BundleIcon } from '@patternfly/react-icons';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

/**
 * Helper function to proprly calculate what to do when user clicks on first cell.
 * Either full redirect if used with ctrl button or `onRowClick` from props is used.
 *  @param {*} event html event, to find out if meta key was clicked.
 *  @param {*} key   inventory UUID.
 *  @param {*} props additional props from `EntityTable` - loaded, onRowClick and noDetail.
 *  @param     id
 */
const onRowClick = (event, id, { loaded, onRowClick: rowClick, noDetail }) => {
  if (loaded && !noDetail) {
    const isMetaKey = event.ctrlKey || event.metaKey || event.which === 2;
    if (isMetaKey) {
      return;
    } else if (rowClick) {
      rowClick(event, id, isMetaKey);
    }
  }

  event.preventDefault();
  event.stopPropagation();
};
/**
 * Helper component to generate first cell in plain inventory either with clickable detail or just data from attribut.
 * This is later on used in redux in `renderFunc`.
 *  @param {React.node} children React node with information that will be shown to user as column title.
 *  @param {string}     id       inventory UUID, used to navigate to correct URL.
 *  @param {*}          item     row data, holds every information from redux store for currecnt row.
 *  @param {*}          props    additional props passed from `EntityTable` - holds any props passed to inventory table.
 */
const TitleColumn = ({ children, id, item, ...props }) => {
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter',
  );
  let imageContent;
  let packageContent;
  if (edgeParityFilterDeviceEnabled) {
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
  return (
    <div className="ins-composed-col sentry-mask data-hj-suppress">
      {item?.os_release && <div key="os_release">{item?.os_release}</div>}
      <div key="data" className={props?.noDetail ? 'ins-m-nodetail' : ''}>
        {props?.noDetail ? (
          children
        ) : (
          <span>
            {item?.system_profile?.bootc_status?.booted?.image_digest ? (
              <Popover
                triggerAction="hover"
                headerContent="Image-based system"
                bodyContent={<div>{imageContent}</div>}
              >
                <Icon
                  style={{ marginRight: '8px' }}
                  aria-label="Image mode icon"
                >
                  <FontAwesomeImageIcon
                    fill="var(--pf-v5-global--icon--Color--light)"
                    margin="0px"
                  />
                </Icon>
              </Popover>
            ) : (
              <Popover
                triggerAction="hover"
                headerContent="Package-based system"
                bodyContent={<div>{packageContent}</div>}
              >
                <Icon
                  style={{ marginRight: '8px' }}
                  aria-label="Package mode icon"
                >
                  <BundleIcon color="var(--pf-v5-global--icon--Color--light)" />
                </Icon>
              </Popover>
            )}
            <Link
              to={item?.href || item?.to || id}
              {...{
                ...(props?.onRowClick
                  ? {
                      onClick: (event) => {
                        onRowClick(event, id, props);
                      },
                    }
                  : {}),
              }}
            >
              {children}
            </Link>
            {item?.system_profile?.operating_system?.name ===
              'CentOS Linux' && <ConversionPopover />}
          </span>
        )}
      </div>
    </div>
  );
};

export default TitleColumn;
