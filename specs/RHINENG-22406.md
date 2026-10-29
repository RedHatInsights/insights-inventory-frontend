# Spec: RHINENG-22406

## Summary
Fix layout of 'Filter by tags' dropdown menu to prevent the count badge from being cut off by the scrollbar when tag names are long.

## Root Cause
In `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx`, the `Flex` container wrapping the tag option name and count badge does not span the full width of the dropdown menu item and lacks space-between justification. Additionally, the `FlexItem` wrapping the tag name (which uses a `Truncate` component) does not have a minimum width set, preventing the `Truncate` component from shrinking when the tag name is long. Consequently, the tag name pushes the count badge to the right, causing it to be compressed or cut off by the dropdown's scrollbar.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): In the tag option rendering section, update the Flex container that wraps the tag name and count badge: add full-width inline style and space-between justification. On the first FlexItem (wrapping Truncate), add an inline style with minWidth 0 so the Truncate component can actually shrink for long tag names. On the second FlexItem (wrapping the Tooltip/Badge), add flex none and inline style with flexShrink 0 so the badge is never compressed or pushed off-screen by the scrollbar.

## Constraints
- The tag name must truncate with ellipsis when too long, not wrap or overflow
- The count badge must always remain fully visible and not overlap with the scrollbar
