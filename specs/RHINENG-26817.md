# Spec: RHINENG-26817

## Summary
Update stale 'Register Systems' references to 'Registration Assistant' in the disconnected indicator tooltip and the registration page document title.

## Root Cause
The navigation menu item was renamed from 'Register Systems' to 'Registration Assistant' in Chrome in March 2025. However, the hardcoded tooltip text in `src/Utilities/InsightsDisconnected.js` and the document title in `src/Registration/Routes/Register/Register.js` were never updated to match this change.

## Plan

- `src/Utilities/InsightsDisconnected.js` (modify): Update the tooltip text from "Register Systems" to "Registration Assistant" in the GridItem content string.

- `src/Registration/Routes/Register/Register.js` (modify): Update the document title string passed to chrome.updateDocumentTitle from "Register Systems - Inventory" to "Registration Assistant - Inventory".

## Constraints
- The tooltip must read: From the main navigation, open "Registration Assistant" to learn how to set up …
- The document title must be exactly "Registration Assistant - Inventory".
- No other occurrences of "Register Systems" should remain in src/.
