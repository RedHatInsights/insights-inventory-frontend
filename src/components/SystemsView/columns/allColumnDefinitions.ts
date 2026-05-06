import inventoryColumns from './inventory/columnDefinitions';

/**
 * Default Systems View columns, merged in order from each integrated app.
 *
 * To add an app: import its `./<appId>/columnDefinitions` default export and append
 * with `...thatAppsColumns` (or insert where the column order should appear).
 */
export default [...inventoryColumns];
