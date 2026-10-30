# Spec: RHINENG-22406

## Summary
Fix layout of 'Filter by tags' dropdown menu to prevent the count badge from being cut off by the scrollbar when tag names are long.

## Root Cause
In `TagsFilter.tsx`, the `Flex` container wrapping the tag name and count badge does not span the full width of the dropdown menu option, nor does it use space-between justification. Additionally, the `FlexItem` wrapping the tag name does not have `minWidth: 0` set, which prevents the `Truncate` component from shrinking when the tag name is long. Finally, the `FlexItem` wrapping the count badge does not have `flexNone` or `flexShrink: 0` set, causing the badge to be compressed or cut off by the scrollbar when space is limited.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): Update the Flex container (around line 146) wrapping the tag name and count badge inside each SelectOption to use full width and space-between justification. On the first FlexItem (wrapping Truncate), add a style with minWidth 0 so truncation works when space is constrained. On the second FlexItem (wrapping the Tooltip/Badge), set flex to flexNone to prevent the badge from shrinking or being compressed by the scrollbar.

## Constraints
- The tag name must truncate with an ellipsis when too long, rather than pushing the badge off-screen or wrapping to a new line.
- The count badge must remain fully visible and never shrink or be hidden by the scrollbar.
- The Flex container must not wrap — tag name and badge must always stay on the same line.
