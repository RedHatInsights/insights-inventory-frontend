import React from 'react';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';
import { useSystemActionModalsContext } from '../../../SystemActionModalsContext';
import { System } from '../../../hooks/useSystemsQuery';

interface TagsProps {
  system: System;
}
export const Tags = ({ system }: TagsProps) => {
  const { openTagsModal } = useSystemActionModalsContext();

  return (
    <TagCount
      count={system.tags?.length || 0}
      onTagClick={() => openTagsModal([system])}
    />
  );
};

export default Tags;
