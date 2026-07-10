import React from 'react';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';
import { useSystemActionModalsContext } from '../../../SystemActionModalsContext';
import { System } from '../../../../InventoryViews/hooks/useHostsQuery';
import CellValue from '../../CellValue';

interface TagsProps {
  value: System['tags'];
  system: System;
}

export const Tags = ({ value, system }: TagsProps) => {
  const { openTagsModal } = useSystemActionModalsContext();

  if (value === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Tag data is not available for this system"
      />
    );
  }

  return (
    <CellValue
      type="present"
      value={
        <TagCount
          count={value.length}
          onTagClick={() => openTagsModal([system])}
        />
      }
    />
  );
};

export default Tags;
