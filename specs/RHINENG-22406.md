# Spec: RHINENG-22406

## Summary
The badge number on the 'Filter by tags' dropdown menu is cut off by the scrollbar because long tag names push the badge to the right, overflowing the menu container.

## Root Cause
The `Flex` container inside the `SelectOption` of the `TagsFilter` component does not have a width of 100% or space-between justification, and the first `FlexItem` containing the `Truncate` component does not have `minWidth: 0` (or `shrink` enabled). In CSS Flexbox, flex items have a default `min-width: auto`, which prevents them from shrinking below their minimum content size. When a tag name is long, the first `FlexItem` does not shrink, which pushes the second `FlexItem` (the badge) to the right, causing it to overflow the dropdown's 300px width and get cut off/hidden under the scrollbar.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): In the Flex container inside SelectOption, add full width styling and space-between justification so the badge stays within bounds. On the first FlexItem (wrapping Truncate), set minWidth to 0 so the flex item can shrink below its content size, allowing the Truncate component to actually truncate long tag names. On the second FlexItem (wrapping the Badge), prevent it from shrinking so the badge count always remains fully visible.

## Constraints
- The badge (count) must remain fully visible and not be cut off by the scrollbar on the right side of the dropdown menu
- Tag names must truncate with ellipsis when too long, rather than overflowing
- Do not change the dropdown width (FILTER_DROPDOWN_WIDTH remains 300px)
