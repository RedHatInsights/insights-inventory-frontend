# Spec: RHINENG-22406

## Summary
Fix layout of 'Filter by tags' dropdown menu to prevent the count badge from being cut off by the scrollbar when tag names are long.

## Root Cause
In the 'Filter by tags' dropdown menu, the Flex container wrapping the tag name and count badge does not span the full width of the menu option, nor does it use space-between justification. When tag names are long, the tag name FlexItem does not shrink (due to missing minWidth: 0), which prevents the Truncate component from operating properly. Consequently, the count badge is compressed and cut off by the scrollbar on the right side of the dropdown.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): In the Flex container wrapping each tag option (around line 139), add fullWidth and justifyContent space-between props so the tag name and badge span the full menu option width. On the tag-name FlexItem, add a style with minWidth 0 so the Truncate component can shrink properly. On the badge FlexItem, add flex none (or flexShrink 0) so the badge is never compressed.

- `src/components/SystemsView/filters/inventory/components/TagsFilter.test.js` (modify): Add a test case that renders a tag with a long name, opens the dropdown, and asserts that the Badge element is visible and present in the document (ensuring it is not clipped). This verifies the layout fix keeps the count badge accessible regardless of tag name length.

## Constraints
- The tag name must truncate (via Truncate component) when space is constrained rather than pushing the badge off-screen.
- The count badge must remain fully visible and never be compressed or hidden by the scrollbar.
- Do not change the overall dropdown width or popperProps configuration.
