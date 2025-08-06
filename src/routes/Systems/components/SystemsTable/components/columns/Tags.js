import React from 'react';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';
import PropTypes from 'prop-types';

const Tags = ({ tags, systemId }) => (
  <TagCount count={tags?.length || 0} systemId={systemId} />
);

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object),
  systemId: PropTypes.string,
};

export default Tags;
