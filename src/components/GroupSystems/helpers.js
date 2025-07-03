import React from 'react';
import { Link } from 'react-router-dom';
import TitleColumn from '../InventoryTable/TitleColumn';

export const prepareColumnsCoventional = (initialColumns, hideGroupColumn) => {
  // hides the "groups" column
  const columns = hideGroupColumn
    ? initialColumns.filter(({ key }) => key !== 'groups')
    : [...initialColumns];

  columns[columns.findIndex(({ key }) => key === 'display_name')].renderFunc = (
    displayName,
    id,
    item,
    props,
  ) => <TitleColumn {...{ ...props, id, item }}>{displayName}</TitleColumn>;

  // map columns to the speicifc order
  return ['display_name', 'groups', 'tags', 'system_profile', 'updated']
    .map((colKey) => columns.find(({ key }) => key === colKey))
    .filter(Boolean); // eliminate possible undefined's
};

export const prepareColumnsImmutable = (
  initialColumns,
  hideGroupColumn,
  openTabOnClick = false,
) => {
  // hides the "groups" column
  const columns = hideGroupColumn
    ? initialColumns.filter(({ key }) => key !== 'groups')
    : [...initialColumns];
  columns[columns.findIndex(({ key }) => key === 'display_name')].renderFunc = (
    value,
    hostId,
  ) => (
    <div className="sentry-mask data-hj-suppress">
      <Link
        to={`../${hostId}`}
        {...(openTabOnClick ? { target: '_blank' } : {})}
      >
        {value}
      </Link>
    </div>
  );

  // map columns to the specific order
  return [
    'display_name',
    'groups',
    'tags',
    'system_profile',
    'update_method',
    'updated',
    'image',
    'status',
  ]
    .map((colKey) => columns.find(({ key }) => key === colKey))
    .filter(Boolean); // eliminate possible undefined's
};
