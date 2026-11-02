# Spec: RHINENG-26825

## Summary
Add bottom margin to the alert banner in InsightsPrompt to provide visual spacing between the banner and the tab bar on the system detail page.

## Root Cause
The `Alert` component inside `InsightsPrompt` does not have any bottom margin or spacing defined. Since it is rendered directly above the tab bar (`ApplicationDetails`) on the system detail page, the two elements sit directly against each other without any visual separation.

## Plan

- `src/components/InventoryDetail/InsightsPrompt.js` (modify): Add the PatternFly utility class for medium bottom margin to the Alert component via its className prop, matching the existing pattern used elsewhere in the codebase (e.g., in HostStalenessSettings and BaseDropdown). This introduces visual spacing between the alert banner and the tab bar below it.

## Constraints
- The className must use the PatternFly v6 utility class pf-v6-u-mb-md for consistency with existing usage in the codebase.
- No other layout or styling changes should be made to InsightsPrompt or the system detail page.
