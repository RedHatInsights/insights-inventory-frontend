import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchAllTags, toggleTagModal } from '../store/actions';
import { TagModal } from '@redhat-cloud-services/frontend-components/TagModal';
import { cellWidth } from '@patternfly/react-table';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import { PAGINATION_DEFAULT } from '../constants';

const TagsModal = ({
  entity,
  filterTagsBy = '',
  onToggleModal = () => undefined,
  onApply,
  getTags,
  selected: preselectedTags = [],
}) => {
  const dispatch = useDispatch();
  const [filterBy, setFilterBy] = useState('');
  const [selected, setSelected] = useState();
  const [statePagination, setStatePagination] = useState(PAGINATION_DEFAULT);
  const isInitialMount = useRef(true);
  const showTagDialog = useSelector(
    ({ entities, entityDetails }) => (entities || entityDetails)?.showTagDialog,
  );

  const pagination = useSelector(({ entities }) => {
    if (entities?.activeSystemTag || entity) {
      return statePagination;
    }

    return entities?.allTagsPagination || statePagination;
  }, shallowEqual);

  const loaded = useSelector(
    ({ entities, entityDetails }) =>
      entities?.tagModalLoaded || entityDetails?.tagModalLoaded,
  );

  const activeSystemTag = useSelector(({ entities }) => {
    if (entity) {
      return entity;
    }

    if (entities?.activeSystemTag) {
      return entities.activeSystemTag;
    }
  });

  const tags = useSelector(({ entities }) => {
    const activeTags = entities?.activeSystemTag?.tags || entity?.tags;

    if (activeTags) {
      return activeTags
        ?.filter((tag) =>
          Object.values(tag).some((val) =>
            val?.toLowerCase().includes(filterBy.toLowerCase()),
          ),
        )
        .slice(
          statePagination?.perPage * (statePagination?.page - 1),
          statePagination?.perPage * statePagination?.page,
        );
    }

    return entities?.allTags?.reduce(
      (acc, { tags }) => [...acc, ...flatten(tags.map(({ tag }) => tag))],
      [],
    );
  });

  const tagsCount = useSelector(({ entities }) => {
    const activeTags = (
      entities?.activeSystemTag?.tags || entity?.tags
    )?.filter((tag) =>
      Object.values(tag).some((val) => val?.includes(filterBy)),
    );
    return activeTags ? activeTags.length : entities?.allTagsTotal;
  });

  useEffect(() => {
    setFilterBy(filterTagsBy);
  }, [filterTagsBy]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    setSelected(preselectedTags);
  }, [JSON.stringify(preselectedTags)]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchTags = useCallback(
    (pagination, filterBy) => {
      if (!activeSystemTag) {
        dispatch(fetchAllTags(filterBy, pagination, getTags));
      } else {
        setStatePagination(() => pagination);
      }
    },
    [activeSystemTag, dispatch, getTags],
  );

  const debouncedFetch = useMemo(() => debounce(fetchTags, 800), [fetchTags]);

  const onUpdateData = useCallback(
    (pagination) => fetchTags(pagination, filterBy),
    [fetchTags, filterBy],
  );

  // Initial fetch when modal opens
  useEffect(() => {
    if (showTagDialog) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        if (!activeSystemTag) {
          fetchTags(pagination, '');
        }
      }
    } else {
      // Reset when modal closes
      isInitialMount.current = true;
    }
  }, [showTagDialog, activeSystemTag, fetchTags, pagination]);

  const isSelected = (id, { key, value, namespace }) =>
    id === `${namespace}/${key}=${value}`;

  const rows = useMemo(() => {
    return tags?.map(({ key, value, namespace }) => {
      const isSel =
        selected?.filter(({ id }) => isSelected(id, { key, value, namespace }))
          .length || false;

      return {
        id: `${namespace}/${key}=${value}`,
        selected: isSel,
        cells: [key, value, namespace],
        item: {
          meta: {
            tag: { key, value },
          },
        },
      };
    });
  }, [selected, tags]);

  return (
    <TagModal
      className="ins-c-inventory__tags-modal"
      tableProps={{
        canSelectAll: false,
      }}
      {...(loaded && {
        loaded,
        pagination: {
          ...pagination,
          count: tagsCount,
        },
        rows,
      })}
      loaded={loaded}
      isOpen={showTagDialog}
      toggleModal={() => {
        setSelected(preselectedTags);
        setFilterBy('');
        onToggleModal();
        setStatePagination(PAGINATION_DEFAULT);
        dispatch(toggleTagModal(false));
      }}
      filters={[
        {
          label: 'Tags filter',
          placeholder: 'Filter tags',
          value: 'tags-filter',
          type: 'text',
          filterValues: {
            value: filterBy,
            onChange: (_e, value) => {
              debouncedFetch(pagination, value);
              setFilterBy(value);
            },
          },
        },
      ]}
      onUpdateData={onUpdateData}
      columns={[
        { title: 'Name' },
        { title: 'Value', transforms: [cellWidth(30)] },
        { title: 'Tag source', transforms: [cellWidth(30)] },
      ]}
      {...(!activeSystemTag && {
        onSelect: (selected) => setSelected(selected),
        selected,
        onApply: () => onApply?.(selected),
      })}
      bulkSelect={{ id: 'bulk-select-tags' }}
      title={
        activeSystemTag
          ? `${
              activeSystemTag.display_name || activeSystemTag.name
            } (${tagsCount})`
          : `All tags in inventory (${tagsCount})`
      }
    />
  );
};

TagsModal.propTypes = {
  entity: PropTypes.object,
  onApply: PropTypes.func,
  onToggleModal: PropTypes.func,
  filterTagsBy: PropTypes.string,
  getTags: PropTypes.func,
  selected: PropTypes.array,
};

export default TagsModal;
