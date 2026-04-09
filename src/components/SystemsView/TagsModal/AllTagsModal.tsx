import React, { useMemo, useState } from 'react';
import { useDataViewPagination } from '@patternfly/react-data-view';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { BaseTagsModal } from './BaseTagsModal';
import TagsModalTable from './TagsModalTable';
import {
  matchTagRowItems,
  selectionItemToFilterStr,
  filterStrsToSelectedTagTuples,
} from './tagsModalTableHelpers';
import { useDebouncedValue } from '../../../Utilities/hooks/useDebouncedValue';
import { useTagsQuery } from '../hooks/useTagsQuery';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import {
  DEBOUNCE_TIMEOUT_MS,
  INITIAL_PAGE,
  PER_PAGE,
} from '../../../constants';

export interface AllTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTagSearch?: string;
}

export const AllTagsModal = ({
  isOpen,
  onClose,
  initialTagSearch = '',
}: AllTagsModalProps) => {
  const { filters, onSetFilters } = useDataViewFiltersContext();
  const [inventorySearch, setInventorySearch] = useState(initialTagSearch);

  const tagSelection = useDataViewSelection({
    matchOption: matchTagRowItems,
    initialSelected: filterStrsToSelectedTagTuples(filters.tags ?? []),
  });

  const [tagSelectionBaseline] = useState<string[]>(() =>
    [...(filters.tags ?? [])].sort(),
  );

  const isSelectionDirty = useMemo(() => {
    const current = [
      ...tagSelection.selected.map(selectionItemToFilterStr).filter(Boolean),
    ].sort();
    if (tagSelectionBaseline.length !== current.length) {
      return true;
    }
    return tagSelectionBaseline.some((t, i) => t !== current[i]);
  }, [tagSelection.selected, tagSelectionBaseline]);

  const pagination = useDataViewPagination({
    perPage: PER_PAGE,
    page: INITIAL_PAGE,
  });

  const debouncedSearch = useDebouncedValue(
    inventorySearch,
    DEBOUNCE_TIMEOUT_MS,
  );

  const { data, total, isLoading, isError } = useTagsQuery({
    search: debouncedSearch,
    page: pagination.page,
    perPage: pagination.perPage,
    enabled: isOpen,
  });

  const inventoryTagList = useMemo(
    () => data?.map(({ tag }) => tag) ?? [],
    [data],
  );

  const serverPagination =
    typeof total === 'number' ? { total, ...pagination } : undefined;

  const serverSearch = {
    value: inventorySearch,
    onChange: (value: string) => {
      setInventorySearch(value);
      pagination.onSetPage(undefined, INITIAL_PAGE);
    },
  };

  const isTableLoading = isLoading && data === undefined;

  return (
    <BaseTagsModal
      isOpen={isOpen}
      onClose={onClose}
      title="All tags in inventory"
      isClientControlled={false}
      isDirty={isSelectionDirty}
      onConfirm={() => {
        onSetFilters({
          tags: tagSelection.selected
            .map(selectionItemToFilterStr)
            .filter(Boolean),
        });
      }}
    >
      <TagsModalTable
        tags={inventoryTagList}
        isLoading={isTableLoading}
        isError={isError}
        serverPagination={serverPagination}
        serverSearch={serverSearch}
        selection={tagSelection}
      />
    </BaseTagsModal>
  );
};
