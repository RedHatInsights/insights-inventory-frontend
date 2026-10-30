# Spec: RHINENG-22406

## Summary
Fix layout of 'Filter by tags' dropdown menu to prevent the count badge from being cut off by the scrollbar when tag names are long.

## Root Cause
In the 'Filter by tags' dropdown menu, the Flex container wrapping the tag name and count badge does not span the full width of the menu option, nor does it use space-between justification. When tag names are long, the tag name FlexItem does not shrink (due to missing minWidth: 0), which prevents the Truncate component from operating properly. Consequently, the count badge is compressed and cut off by the scrollbar on the right side of the dropdown.

## Plan

- `src/components/SystemsView/filters/inventory/components/TagsFilter.tsx` (modify): In the Flex container wrapping each tag option (around line 139), add fullWidth and justifyContent space-between props so the tag name and badge span the full menu option width. On the tag-name FlexItem, add a style with minWidth 0 so the Truncate component can shrink properly. On the badge FlexItem, add flex none (or flexShrink 0) so the badge is never compressed.

- `src/components/SystemsView/filters/inventory/components/TagsFilter.test.js` (modify): Add a test case that renders a tag with a long name and opens the dropdown. Instead of only asserting the Badge is present in the DOM (which would pass even without the fix since JSDOM does not compute layout/overflow clipping), assert on the applied layout styles and props that prevent clipping: verify the Flex container element has `width: 100%` and `justify-content: space-between` styles, verify the tag-name FlexItem has a `min-width: 0` style, and verify the badge FlexItem has `flex-shrink: 0` (or `flex: none`) style. Also confirm the Badge element is rendered. This ensures the specific CSS fix is in place.

## Constraints
- The tag name must truncate (via Truncate component) when space is constrained rather than pushing the badge off-screen.
- The count badge must remain fully visible and never be compressed or hidden by the scrollbar.
- Do not change the overall dropdown width or popperProps configuration.
