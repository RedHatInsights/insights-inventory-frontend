# Spec: RHINENG-23419

## Summary
Fix 'Add to workspace' modal resizing incorrectly with long dropdown list by updating the PatternFly v6 select menu CSS selector to limit its maximum height.

## Root Cause
In PatternFly v6, the Select component's menu class has changed from `.pf-v6-c-select__menu` to `.pf-v6-c-menu` (or `.pf-v6-c-menu__content`). As a result, the CSS rule `.add-selected-to-group-modal .pf-v6-c-select__menu` in `AddSelectedHostsToGroupModal.scss` is no longer matching the dropdown menu element. This allows the dropdown list to expand to its full height, pushing the modal boundaries and causing incorrect resizing of the modal.

## Plan

- `src/components/InventoryGroups/Modals/AddSelectedHostsToGroupModal.scss` (modify): Replace the `.pf-v6-c-select__menu` selector with `.pf-v6-c-menu__content` so the `max-height: 350px` and `overflow: auto` rules correctly target the PatternFly v6 Select component's internal menu content container. The old PF class name is no longer emitted by the Select component, so the height constraint was never applied, causing the dropdown to expand unbounded and resize the modal (as visible in the defect screenshot where the list extends to the bottom of the viewport).

## Constraints
- The corrected dropdown must be scrollable with a maximum height of 350px, preventing the modal from resizing when many workspaces are listed.
- The modal body must retain overflow: visible so the dropdown can display over the modal boundary if needed.
