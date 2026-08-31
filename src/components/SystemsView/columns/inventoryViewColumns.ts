import {
  bindInventoryColumns,
  type InventoryBindableItem,
} from './inventory/columnDefinitions';
import { bindContentColumns } from './content/columnDefinitions';
import { bindAdvisorColumns } from './advisor/columnDefinitions';
import { bindVulnerabilityColumns } from './vulnerability/columnDefinitions';
import { bindMalwareColumns } from './malware/columnDefinitions';
import { bindComplianceColumns } from './compliance/columnDefinitions';
import type { Column } from './types';

export type { Column as BoundColumn, ColumnSpec, ColumnBinding } from './types';

/**
 * Builds the Inventory Views column set (shared column specs with bindings for Inventory).
 *  @returns Bound columns for Inventory Views, including app-local columns.
 */
export const bindInventoryViewColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  ...bindInventoryColumns<TItem>(),
  ...bindContentColumns<TItem>(),
  ...bindAdvisorColumns<TItem>(),
  ...bindVulnerabilityColumns<TItem>(),
  ...bindMalwareColumns<TItem>(),
  ...bindComplianceColumns<TItem>(),
  /*
    Disabled bindRemediationsColumns<TItem>() on 6.7.2026 as they're on hold
  */
  // ...bindRemediationsColumns<TItem>(),
];

const inventoryViewColumns = bindInventoryViewColumns();

export default inventoryViewColumns;
