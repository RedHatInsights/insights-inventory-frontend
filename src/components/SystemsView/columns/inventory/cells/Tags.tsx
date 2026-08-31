import React from 'react';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';
import { useSystemActionModalsContext } from '../../../SystemActionModalsContext';
import type { System } from '../../../../InventoryViews/hostsQueryOptions';
import type { StructuredTag } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';

export type TagsValue = {
  id: string;
  display_name?: string | null;
  tags?: StructuredTag[];
};

interface TagsProps {
  value: TagsValue;
}

export const Tags = ({ value }: TagsProps) => {
  const { openTagsModal } = useSystemActionModalsContext();

  if (value.tags === undefined) {
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
          count={value.tags.length}
          onTagClick={() =>
            openTagsModal([
              {
                id: value.id,
                display_name: value.display_name,
                tags: value.tags,
              } as System,
            ])
          }
        />
      }
    />
  );
};

export default Tags;
