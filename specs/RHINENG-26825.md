# Spec: RHINENG-26825

## Summary
On the system detail page, there is no margin/spacing between the alert info banner ('Your insights-client is not reporting') and the tab bar below it, causing them to touch.

## Root Cause
The alert banner (InsightsPrompt) is rendered as the last element inside the PageHeader (DetailHeader) on the system detail page. `InsightsPrompt`'s `Alert` component has no `className` prop and therefore no bottom-margin class. Because the PageHeader has its padding-bottom set to 0 (to allow the tab bar to sit flush with the header), `DetailHeader` renders the alert directly before the tab-bar children and the banner touches the tabs with no visual separation.

## Plan

- `src/components/InventoryDetail/InsightsPrompt.js` (modify): Add a PatternFly bottom-margin utility class (pf-v6-u-mb-md) to the Alert component's className prop so there is visible spacing between the alert banner and the tab bar below it. Follow the same pattern used elsewhere in the codebase (e.g., RegAssistCodeBlock.js).

## Constraints
- The corrected appearance must show visible spacing (medium spacer) between the bottom of the alert banner and the top of the tab bar on the system detail page.
- Do not alter spacing or layout of any other component.
