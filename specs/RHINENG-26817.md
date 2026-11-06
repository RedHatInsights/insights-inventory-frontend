# Spec: RHINENG-26817

## Summary
Update stale 'Register Systems' references to 'Registration Assistant' in the disconnected indicator tooltip and the registration page document title.

## Root Cause
The navigation menu item was renamed from 'Register Systems' to 'Registration Assistant' in Chrome. However, the tooltip text in `src/Utilities/InsightsDisconnected.js` and the document title in `src/Registration/Routes/Register/Register.js` still hardcode the old 'Register Systems' name, leading to a mismatch and potential user confusion.

## Plan

- `src/Utilities/InsightsDisconnected.js` (modify): Replace the hardcoded "Register Systems" string in the tooltip content with "Registration Assistant".

- `src/Registration/Routes/Register/Register.js` (modify): In the useEffect call to chrome.updateDocumentTitle, change the string from 'Register Systems - Inventory' to 'Registration Assistant - Inventory'.

## Constraints
- The tooltip must reference 'Registration Assistant' exactly, matching the renamed navigation menu item.
- The document title must be 'Registration Assistant - Inventory' exactly.
