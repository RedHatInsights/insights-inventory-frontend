/* eslint-disable react/prop-types */
import React from 'react';
import { Link } from 'react-router-dom';
import { ConversionPopover } from './ConversionPopover/ConversionPopover';

/**
 * Helper function to proprly calculate what to do when user clicks on first cell.
 * Either full redirect if used with ctrl button or `onRowClick` from props is used.
 * @param {*} event html event, to find out if meta key was clicked.
 * @param {*} key inventory UUID.
 * @param {*} props additional props from `EntityTable` - loaded, onRowClick and noDetail.
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
 * @param {React.node} children React node with information that will be shown to user as column title.
 * @param {string} id inventory UUID, used to navigate to correct URL.
 * @param {*} item row data, holds every information from redux store for currecnt row.
 * @param {*} props additional props passed from `EntityTable` - holds any props passed to inventory table.
 */
const TitleColumn = ({ children, id, item, ...props }) => (
  <div className="ins-composed-col sentry-mask data-hj-suppress">
    {item?.os_release && <div key="os_release">{item?.os_release}</div>}
    <div key="data" className={props?.noDetail ? 'ins-m-nodetail' : ''}>
      {props?.noDetail ? (
        children
      ) : (
        <span>
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
          {item?.system_profile?.operating_system?.name === 'CentOS Linux' && (
            <div>
              <ConversionPopover />
            </div>
          )}
        </span>
      )}
    </div>
  </div>
);

export default TitleColumn;
