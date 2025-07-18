import React from 'react';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';

const Tags = ({ tags, systemId }) => (
  <TagCount count={tags?.length || 0} systemId={systemId} />
);

export default Tags;
