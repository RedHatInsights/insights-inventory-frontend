import React from 'react';
import { Link } from 'react-router-dom';
// TODO bring back
// import { ConversionPopover } from './ConversionPopover/ConversionPopover';
import { Icon, Popover } from '@patternfly/react-core';
import { BundleIcon } from '@patternfly/react-icons';
// // TODO Try to replace with PF icon
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';

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

const DisplayName = ({ id, props, ...item }) => (
  <div className="ins-composed-col sentry-mask data-hj-suppress">
    {item?.os_release && <div key="os_release">{item?.os_release}</div>}
    <div key="data" className={props?.noDetail ? 'ins-m-nodetail' : ''}>
      {props?.noDetail ? (
        item.display_name
      ) : (
        <span>
          {item?.system_profile?.bootc_status?.booted?.image_digest ? (
            <Popover
              triggerAction="hover"
              headerContent="Image-based system"
              bodyContent={
                <div>
                  Image mode for Red Hat Enterprise Linux is a container-native
                  approach that uses the same bits but delivers them as a
                  container image. Updates are immutable and the experience is
                  very close to running a containerized application.
                </div>
              }
            >
              <Icon style={{ marginRight: '8px' }} aria-label="Image mode icon">
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
              bodyContent={
                <div>
                  Package mode is a familiar RHEL experience across any
                  footprint where the OS is assembled and updated from rpm
                  packages. This is traditionally how RHEL is deployed and will
                  remain the preferred method for many.
                </div>
              }
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
                      onRowClick(event, id);
                    },
                  }
                : {}),
            }}
          >
            {item.display_name}
          </Link>
        </span>
      )}
    </div>
  </div>
);

export default DisplayName;
