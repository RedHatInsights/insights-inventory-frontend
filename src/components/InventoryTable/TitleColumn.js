/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import { ConversionPopover } from './ConversionPopover/ConversionPopover';
import { Icon, Popover } from '@patternfly/react-core';
import { BundleIcon } from '@patternfly/react-icons';
import FontAwesomeImageIcon from '../FontAwesomeImageIcon';
import { systemTypeContent } from '../../Utilities/constants';

/**
 * Helper function to proprly calculate what to do when user clicks on first cell.
 * Either full redirect if used with ctrl button or `onRowClick` from props is used.
 *  @param   {object}   event            html event, to find out if meta key was clicked.
 *  @param   {string}   id               inventory UUID.
 *  @param   {object}   props            additional props from `EntityTable` - loaded, onRowClick and noDetail.
 *  @param   {boolean}  props.loaded     boolean, if true, the row can be clicked.
 *  @param   {Function} props.onRowClick function, to handle the row click.
 *  @param   {boolean}  props.noDetail   boolean, if true, the row can be clicked.
 *  @returns {void}                      void
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
 *  @param   {React.node} children React node with information that will be shown to user as column title.
 *  @param   {string}     id       inventory UUID, used to navigate to correct URL.
 *  @param   {object}     item     row data, holds every information from redux store for currecnt row.
 *  @param   {object}     props    additional props passed from `EntityTable` - holds any props passed to inventory table.
 *  @returns {React.node}          React node with information that will be shown to user as column title.
 */
const TitleColumn = ({ children, id, item, ...props }) => {
  return (
    <div className="ins-composed-col sentry-mask data-hj-suppress">
      {item?.os_release && <div key="os_release">{item?.os_release}</div>}
      <div key="data" className={props?.noDetail ? 'ins-m-nodetail' : ''}>
        {props?.noDetail ? (
          children
        ) : (
          <span>
            {item?.system_profile?.bootc_status?.booted?.image_digest ||
            item?.system_profile?.host_type === 'edge' ? (
              <Popover
                triggerAction="hover"
                headerContent="Image-based system"
                bodyContent={<div>{systemTypeContent.imageContent}</div>}
              >
                <Icon
                  style={{ marginRight: '8px' }}
                  aria-label="Image mode icon"
                >
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
                bodyContent={<div>{systemTypeContent.packageContent}</div>}
              >
                <Icon
                  style={{ marginRight: '8px' }}
                  aria-label="Package mode icon"
                >
                  <BundleIcon color="var(--pf-t--global--icon--color--subtle)" />
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
