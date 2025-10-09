import LastSeenFilter from './components/filters/LastSeenFilter';
import WorkspaceFilter from './components/filters/WorkspaceFilter';
import { stringToId } from './filtersHelpers';

export const workspace = {
  Component: WorkspaceFilter,
  filterChips: (configItem, selectedValues) => ({
    category: configItem.label,
    chips: [
      ...selectedValues.map((name) => ({
        name: name ? name : 'No Workspace',
      })),
    ],
  }),
  toSelectValue: (configItem, _selectedValue, selectedValues) => {
    return [selectedValues, stringToId(configItem.label), true];
  },
  toDeselectValue: (configItem, chip) => {
    const chipName = chip?.chips?.[0]?.name;
    const customDeselectValue = chipName === 'No Workspace' ? '' : chipName;
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
