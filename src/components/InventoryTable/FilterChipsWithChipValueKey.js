import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@patternfly/react-core/dist/dynamic/components/Badge';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Chip } from '@patternfly/react-core/dist/dynamic/deprecated/components/Chip';
import { ChipGroup } from '@patternfly/react-core/dist/dynamic/deprecated/components/Chip';
import classNames from 'classnames';
import '@redhat-cloud-services/frontend-components/FilterChips/filter-chips.css';

function isFilterChipGroup(group) {
  return Object.prototype.hasOwnProperty.call(group, 'category');
}

function isPlainFilterChip(group) {
  return !isFilterChipGroup(group);
}

/** Prefer chip.value for React keys so chip.name can be a non-string (e.g. loading spinner). */
function chipElementKey(chip) {
  if (Object.prototype.hasOwnProperty.call(chip, 'value')) {
    return String(chip.value);
  }
  return String(chip.name);
}

/**
 * Same as frontend-components FilterChips, but Chip keys use chip.value when set
 * so grouped workspace chips can render React nodes in chip.name (RHCS FilterChips
 * uses chip.name as both label and key).
 */
const FilterChipsWithChipValueKey = ({
  className,
  filters = [],
  onDelete = () => undefined,
  deleteTitle = 'Clear filters',
  showDeleteButton,
  onDeleteGroup,
}) => {
  const groups = filters.filter(isFilterChipGroup);
  const groupedFilters = groups.map((group, groupKey) => (
    <ChipGroup
      key={`group_${group.category}`}
      categoryName={String(group.category) || ' '}
      {...(group.chips.length > 1 &&
        onDeleteGroup && {
          isClosable: true,
          onClick: (event) => {
            event.stopPropagation();
            onDeleteGroup(
              event,
              [group],
              groups.filter((_item, key) => key !== groupKey),
            );
          },
        })}
    >
      {group.chips.map((chip) => (
        <Chip
          key={chipElementKey(chip)}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(event, [{ ...group, chips: [chip] }]);
          }}
        >
          {chip.name}
          {chip.count && (
            <Badge key={`chip_badge_${chip.id}`} isRead={chip.isRead}>
              {chip.count}
            </Badge>
          )}
        </Chip>
      ))}
    </ChipGroup>
  ));

  const plainFilters = filters.filter(isPlainFilterChip);

  return (
    <span className={classNames(className, 'ins-c-chip-filters')}>
      {groupedFilters}
      {plainFilters &&
        plainFilters.map((chip) => (
          <ChipGroup key={`group_plain_chip_${chipElementKey(chip)}`}>
            <Chip
              onClick={(event) => {
                event.stopPropagation();
                onDelete(event, [chip]);
              }}
            >
              {chip.name}
              {chip.count && (
                <Badge key={`chip_badge_${chip.id}`} isRead={chip.isRead}>
                  {chip.count}
                </Badge>
              )}
            </Chip>
          </ChipGroup>
        ))}
      {(showDeleteButton === true ||
        (showDeleteButton === undefined && filters.length > 0)) && (
        <Button
          variant="link"
          ouiaId="ClearFilters"
          onClick={(event) => onDelete(event, filters, true)}
        >
          {deleteTitle}
        </Button>
      )}
    </span>
  );
};

FilterChipsWithChipValueKey.propTypes = {
  className: PropTypes.string,
  filters: PropTypes.arrayOf(PropTypes.object),
  onDelete: PropTypes.func,
  deleteTitle: PropTypes.string,
  showDeleteButton: PropTypes.bool,
  onDeleteGroup: PropTypes.func,
};

export default FilterChipsWithChipValueKey;
