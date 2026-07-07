import useFeatureFlag from './useFeatureFlag';

const useLegacyInventoryTableFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.legacy-inventory-table');
  const hasLocalFlag =
    localStorage.getItem('ui.legacy-inventory-table') === 'true';

  return hasUnleashFlag || hasLocalFlag;
};

export default useLegacyInventoryTableFeatureFlag;
