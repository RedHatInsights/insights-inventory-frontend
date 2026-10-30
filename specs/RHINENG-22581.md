# Spec: RHINENG-22581

## Summary
Tags Modal: Search Input not clean upon initial open and title is undefined

## Root Cause
When `openTagsModal` is called while the modal is already open (e.g. switching from one system's tags to another without explicitly closing first), `tagsModalOpen` remains `true` and the conditional rendering (`{tagsModalOpen && ...}`) does not unmount the previous modal subtree. This means the old `TagsModalTable` instance and its internal search input state persist, causing stale search text to appear for the new system. The close-then-reopen path already remounts correctly because the conditional rendering unmounts the modal when `tagsModalOpen` becomes `false`.

The title display uses `system.display_name ?? ''` which already handles `undefined`/`null` correctly. The `|| ''` change is a minor defensive improvement that additionally covers other falsy values (e.g. `0`, `false`), though these are unlikely in practice.

## Plan

- `src/components/SystemsView/TagsModalContext.tsx` (modify): Add a numeric counter state (`modalKey`) that increments each time `openTagsModal` is called. Pass this counter as the `key` prop to both `AllTagsModal` and `SingleHostTagsModal` so that React fully remounts the modal on every `openTagsModal` call. This guarantees fresh internal state (empty search input, reset pagination) even when the modal is opened for a different system without an intervening close.

- `src/components/SystemsView/TagsModal/SingleHostTagsModal.tsx` (modify): In the title computation, replace the nullish coalescing fallback (`system.display_name ?? ''`) with a logical-OR fallback (`system.display_name || ''`) as a minor defensive measure against any falsy display_name values.

- `src/components/SystemsView/TagsModalContext.test.tsx` (modify): Add two new test cases: (1) verify that when openTagsModal is called with a system whose display_name is undefined or null, the modal title does NOT contain the word 'undefined'; (2) verify that opening the modal for a second system (without closing first) results in a clean/reset search input in the rendered TagsModalTable.

## Constraints
- The search input in the Tags modal must be empty on every fresh open from the Tags column cell.
- The modal title must never render as 'undefined (N)' — when display_name is missing, the title should omit the name portion gracefully.
