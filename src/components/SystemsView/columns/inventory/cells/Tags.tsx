import React from 'react';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';
import type { StructuredTag } from '@redhat-cloud-services/host-inventory-client';
import { useSystemActionModalsContext } from '../../../SystemActionModalsContext';
import { System } from '../../../hooks/useSystemsQuery';
import CellValue from '../../CellValue';

interface TagsProps {
  value: StructuredTag[] | undefined;
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
