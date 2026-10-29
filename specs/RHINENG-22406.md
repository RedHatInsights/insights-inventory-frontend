# Spec: RHINENG-22406

## Summary
Fix layout of 'Filter by tags' dropdown menu to prevent the count badge from being cut off by the scrollbar when tag names are long.

## Root Cause
In the 'Filter by tags' dropdown menu, long tag names push the count badge to the right, causing it to overflow the menu container and get cut off by the scrollbar. This happens because the Flex container does not span the full width of the menu option, does not use space-between justification, and the tag name FlexItem does not have a minWidth of 0 (which is required for the Truncate component to shrink the text). Additionally, the badge FlexItem is allowed to shrink, which can compress the badge.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): In the Flex container that wraps each tag option (around the tag name and badge), add full width styling and space-between justification so the badge is pushed to the right edge. On the tag name FlexItem, set minWidth to 0 so that the Truncate component can properly shrink long names. On the badge FlexItem, prevent shrinking so the badge is never compressed or clipped by the scrollbar.

## Constraints
- The tag name must truncate with an ellipsis when too long, rather than overflowing or wrapping.
- The count badge must remain fully visible and not overlap the scrollbar.
- Do not change the dropdown width or any other filter component.
