# Spec: RHINENG-22630

## Summary
Improve display of Staleness 'Default settings' helper popover by preventing bullet points from wrapping into multiple lines.

## Root Cause
The 'Default settings' helper popover (`HostStalenessResetPopover`) does not have the `hasAutoWidth` prop set on the PatternFly `Popover` component. As a result, the popover uses the default maximum width, causing the bullet points to wrap onto multiple lines.

## Plan

- `src/components/InventoryHostStaleness/HostStalenessResetPopover.tsx` (modify): Add the `hasAutoWidth` prop to the `Popover` component, matching the pattern already used in `HostStalenessPopover.tsx` in the same directory.

## Constraints
- The bullet points in the 'Default settings' popover must each render on a single line without wrapping.
