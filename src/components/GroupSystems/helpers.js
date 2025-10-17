import React from 'react';
import TitleColumn from '../InventoryTable/TitleColumn';

export const prepareColumns = (initialColumns, hideGroupColumn) => {
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
