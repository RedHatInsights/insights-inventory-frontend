import type { InventoryFilters } from './filters/SystemsViewFilters';

export const INITIAL_INVENTORY_FILTERS: InventoryFilters = {
  hostname_or_id: '',
  status: [],
  source: [],
  rhcStatus: [],
  system_type: [],
  group_id: [],
  last_seen: '',
  tags: [],
  operating_system: [],
  workloads: [],
};
