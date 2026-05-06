import LastSeenFilter from './components/filters/LastSeenFilter';
import WorkspaceFilter from './components/filters/WorkspaceFilter';
import { stringToId } from './filtersHelpers';

export const workspace = {
  Component: WorkspaceFilter,
  filterChips: (configItem, selectedValues) => ({
    category: configItem.label,
    chips: [
      ...selectedValues.map((id) => ({
        name: id ? id : 'Ungrouped hosts',
        value: id,
      })),
    ],
  }),
  toSelectValue: (configItem, _selectedValue, selectedValues) => {
    return [selectedValues, stringToId(configItem.label), true];
  },
  toDeselectValue: (configItem, chip) => {
    const c = chip?.chips?.[0];
    const raw = c?.value !== undefined && c?.value !== null ? c.value : c?.name;
    const customDeselectValue = raw === 'Ungrouped hosts' ? '' : raw;
    return [customDeselectValue, stringToId(configItem.label), false];
  },
};

export const lastSeen = {
  Component: LastSeenFilter,
  filterChips: (configItem, value) => ({
    category: configItem.label,
    chips: [{ name: value?.label }],
  }),
  toSelectValue: (configItem, selectedValue, selectedValues) => {
    const customSelectValue = selectedValue || selectedValues;
    return [customSelectValue, stringToId(configItem.label), true];
  },
  toDeselectValue: (configItem) => {
    const customDeselectValue = [];
    return [customDeselectValue, stringToId(configItem.label), true];
  },
};

/**
 *
 * Default set of filter types to provide
 *
 */
export default {
  workspace,
  lastSeen,
};
