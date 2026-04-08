import React, { useMemo } from 'react';
import { BaseTagsModal } from './BaseTagsModal';
import TagsModalTable from './TagsModalTable';
import type { System } from '../hooks/useSystemsQuery';

export interface SingleHostTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: System;
}

export const SingleHostTagsModal = ({
  isOpen,
  onClose,
  system,
}: SingleHostTagsModalProps) => {
  const title = useMemo(
    () => `${system.display_name ?? ''} (${system.tags?.length ?? 0})`,
    [system.display_name, system.tags?.length],
  );

  return (
    <BaseTagsModal isOpen={isOpen} onClose={onClose} title={title}>
      <TagsModalTable tags={system.tags} />
    </BaseTagsModal>
  );
};
