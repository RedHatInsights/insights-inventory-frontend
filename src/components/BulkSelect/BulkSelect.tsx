/**
 * Vendored from PatternFly `react-component-groups` (BulkSelect).
 * Source: https://github.com/patternfly/react-component-groups/blob/main/packages/module/src/BulkSelect/BulkSelect.tsx
 * License: MIT (PatternFly / Red Hat)
 *
 * Copied locally for customization; keep in sync with upstream when upgrading PatternFly packages.
 */
import React, { useMemo, useState, type FC, type Ref } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  DropdownListProps,
  DropdownProps,
  MenuToggle,
  MenuToggleCheckbox,
  MenuToggleCheckboxProps,
  MenuToggleElement,
  MenuToggleProps,
} from '@patternfly/react-core';

export const BulkSelectValue = {
  all: 'all',
  none: 'none',
  page: 'page',
  nonePage: 'nonePage',
} as const;

export type BulkSelectValue =
  (typeof BulkSelectValue)[keyof typeof BulkSelectValue];

export type BulkSelectSource = 'checkbox' | 'dropdown';

const defaultSelectPageLabel = (pageCount?: number) =>
  `Select page${pageCount ? ` (${pageCount})` : ''}`;
const defaultSelectAllLabel = (totalCount?: number) =>
  `Select all${totalCount ? ` (${totalCount})` : ''}`;
const defaultSelectedLabel = (selectedCount: number) =>
  `${selectedCount} selected`;

/** extends DropdownProps */
export interface BulkSelectProps
  extends Omit<DropdownProps, 'toggle' | 'onSelect'> {
  /** BulkSelect className */
  className?: string;
  /** Indicates whether selectable items are paginated */
  isDataPaginated?: boolean;
  /** Indicates whether "Select all" option should be available */
  canSelectAll?: boolean;
  /** Number of entries present in current page */
  pageCount?: number;
  /** Number of selected entries */
  selectedCount: number;
  /** Number of all entries */
  totalCount?: number;
  /** Indicates if ALL current page items are selected */
  pageSelected?: boolean;
  /** Indicates if ONLY some current page items are selected */
  pagePartiallySelected?: boolean;
  /** Callback called on item select */
  onSelect: (value: BulkSelectValue, source?: BulkSelectSource) => void;
  /** Custom OUIA ID */
  ouiaId?: string;
  /** Additional props for MenuToggleCheckbox */
  menuToggleCheckboxProps?: Omit<
    MenuToggleCheckboxProps,
    'onChange' | 'isChecked' | 'instance' | 'ref'
  >;
  /** Additional props for DropdownList */
  dropdownListProps?: Omit<DropdownListProps, 'children'>;
  /** Additional props for MenuToggleProps */
  menuToggleProps?: Omit<
    MenuToggleProps,
    'children' | 'splitButtonItems' | 'ref' | 'isExpanded' | 'onClick'
  >;
  /** Custom label for "Select none" option. Defaults to "Select none (0)" */
  selectNoneLabel?: string;
  /** Custom label for "Select page" option. Receives pageCount as parameter. Defaults to "Select page (N)" */
  selectPageLabel?: (pageCount?: number) => string;
  /** Custom label for "Select all" option. Receives totalCount as parameter. Defaults to "Select all (N)" */
  selectAllLabel?: (totalCount?: number) => string;
  /** Custom label formatter for selected count. Receives selectedCount as parameter. Defaults to "N selected" */
  selectedLabel?: (selectedCount: number) => string;
}

export const BulkSelect: FC<BulkSelectProps> = ({
  isDataPaginated = true,
  canSelectAll,
  pageSelected,
  pagePartiallySelected,
  pageCount,
  selectedCount = 0,
  totalCount = 0,
  ouiaId = 'BulkSelect',
  onSelect,
  menuToggleCheckboxProps,
  dropdownListProps,
  menuToggleProps,
  selectNoneLabel = 'Select none (0)',
  selectPageLabel = defaultSelectPageLabel,
  selectAllLabel = defaultSelectAllLabel,
  selectedLabel = defaultSelectedLabel,
  ...props
}: BulkSelectProps) => {
  const [isOpen, setOpen] = useState(false);

  const splitButtonDropdownItems = useMemo(
    () => (
      <>
        <DropdownItem
          ouiaId={`${ouiaId}-select-none`}
          value={BulkSelectValue.none}
          key={BulkSelectValue.none}
        >
          {selectNoneLabel}
        </DropdownItem>
        {isDataPaginated && (
          <DropdownItem
            ouiaId={`${ouiaId}-select-page`}
            value={BulkSelectValue.page}
            key={BulkSelectValue.page}
          >
            {selectPageLabel(pageCount)}
          </DropdownItem>
        )}
        {canSelectAll && (
          <DropdownItem
            ouiaId={`${ouiaId}-select-all`}
            value={BulkSelectValue.all}
            key={BulkSelectValue.all}
          >
            {selectAllLabel(totalCount)}
          </DropdownItem>
        )}
      </>
    ),
    [
      isDataPaginated,
      canSelectAll,
      ouiaId,
      selectNoneLabel,
      selectPageLabel,
      selectAllLabel,
      pageCount,
      totalCount,
    ],
  );

  const selectedLabelText = selectedLabel(selectedCount);

  const allOption = isDataPaginated
    ? BulkSelectValue.page
    : BulkSelectValue.all;
  const noneOption = isDataPaginated
    ? BulkSelectValue.nonePage
    : BulkSelectValue.none;

  const onToggleClick = () => setOpen(!isOpen);

  return (
    <Dropdown
      shouldFocusToggleOnSelect
      ouiaId={`${ouiaId}-dropdown`}
      onSelect={(_e, value) => {
        setOpen(!isOpen);
        onSelect?.(value as BulkSelectValue, 'dropdown');
      }}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setOpen(isOpen)}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          isExpanded={isOpen}
          onClick={onToggleClick}
          aria-label="Bulk select toggle"
          ouiaId={`${ouiaId}-toggle`}
          splitButtonItems={[
            <MenuToggleCheckbox
              ouiaId={`${ouiaId}-checkbox`}
              id={`${ouiaId}-checkbox`}
              key="bulk-select-checkbox"
              aria-label={`Select ${allOption}`}
              isChecked={
                (isDataPaginated && pagePartiallySelected) ||
                (!isDataPaginated &&
                  selectedCount > 0 &&
                  selectedCount < totalCount)
                  ? null
                  : pageSelected ||
                    (selectedCount === totalCount && totalCount > 0)
              }
              onChange={(checked) =>
                onSelect?.(
                  !checked || checked === null ? noneOption : allOption,
                  'checkbox',
                )
              }
              {...menuToggleCheckboxProps}
            >
              {selectedCount > 0 ? (
                <span data-ouia-component-id={`${ouiaId}-text`}>
                  {selectedLabelText}
                </span>
              ) : null}
            </MenuToggleCheckbox>,
          ]}
          {...menuToggleProps}
        />
      )}
      {...props}
    >
      <DropdownList {...dropdownListProps}>
        {splitButtonDropdownItems}
      </DropdownList>
    </Dropdown>
  );
};

export default BulkSelect;
