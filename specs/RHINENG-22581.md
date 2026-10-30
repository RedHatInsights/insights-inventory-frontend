# Spec: RHINENG-22581

## Summary
Tags Modal: Search Input not clean upon initial open and title is undefined

## Root Cause
The TagsModalProvider does not pass the initialTagSearch prop to SingleHostTagsModal, and SingleHostTagsModal does not pass it down to TagsModalTable. Additionally, the system object passed to openTagsModal from the Tags column cell might have displayName instead of display_name, or display_name is undefined, causing the title to render as 'undefined (0)'.

## Plan

- `src/components/SystemsView/TagsModalContext.tsx` (modify): Add a numeric counter state (e.g. `modalKey`) that increments each time `openTagsModal` is called. Pass this counter as the `key` prop to both `AllTagsModal` and `SingleHostTagsModal` so that React fully remounts the modal (and its child `TagsModalTable`) on every open, guaranteeing fresh internal state (empty search input, reset pagination).

- `src/components/SystemsView/TagsModal/SingleHostTagsModal.tsx` (modify): In the title computation, replace the nullish coalescing fallback (`system.display_name ?? ''`) with a logical-OR fallback (`system.display_name || ''`) so that any falsy display_name value (including empty string or unexpected values) falls back to an empty string. This prevents the modal title from rendering as 'undefined (0)'.

- `src/components/SystemsView/TagsModalContext.test.tsx` (modify): Add two new test cases: (1) verify that when openTagsModal is called with a system whose display_name is undefined or null, the modal title does NOT contain the word 'undefined'; (2) verify that opening the modal a second time (close then re-open) results in a clean/reset search input in the rendered TagsModalTable. The second test should confirm the search text box is empty on re-open.

## Constraints
- The search input in the Tags modal must be empty on every fresh open from the Tags column cell.
- The modal title must never render as 'undefined (N)' — when display_name is missing, the title should omit the name portion gracefully.
