# Spec: RHINENG-22406

## Summary
The badge number on the 'Filter by tags' dropdown menu is cut off by the scrollbar because long tag names push the badge to the right, overflowing the menu container.

## Root Cause
In TagsFilter.tsx, the Flex container wrapping the tag name and the count badge does not have a full width style or space-between justification. Additionally, the tag name FlexItem is not allowed to shrink (it lacks shrink and minWidth: 0 styling), which prevents the Truncate component from operating properly. As a result, long tag names expand the flex item and push the badge to the right, causing it to overflow and get cut off by the scrollbar.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): Update the Flex container wrapping the tag name and badge (around line 138) to span full width with space-between justification. On the tag name FlexItem, allow it to shrink and set minWidth to 0 so that the Truncate component can properly truncate long names. On the badge FlexItem, prevent it from shrinking so the count badge remains fully visible regardless of tag name length.

## Constraints
- The badge number must remain fully visible and not be cut off by the dropdown scrollbar.
- Long tag names must be truncated via the existing Truncate component rather than overflowing.
- The tag name must remain left-aligned and the badge right-aligned within each dropdown item.
