import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { TagCount } from '@redhat-cloud-services/frontend-components/TagCount';
import { loadTags, toggleTagModal } from '../store/actions';

const TagWithDialog = ({ count, systemId }) => {
  const dispatch = useDispatch();
  const triggerLoadTags = (systemId, count) => {
    if (systemId) {
      dispatch(toggleTagModal(true));
      dispatch(loadTags(systemId, undefined, undefined, count));
    }
  };

  return (
    <span
      onClick={(e) => e.stopPropagation()}
      className="ins-c-inventory__list-tags"
      data-ouia-component-id={`${systemId}-tag-button`}
    >
      <TagCount
        count={count}
        onTagClick={() => triggerLoadTags(systemId, count)}
      />
    </span>
  );
};

TagWithDialog.propTypes = {
  count: PropTypes.number,
  loadTags: PropTypes.func,
  systemId: PropTypes.string,
};

export default TagWithDialog;
