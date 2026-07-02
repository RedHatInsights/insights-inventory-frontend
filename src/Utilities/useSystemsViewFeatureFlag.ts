import useFeatureFlag from './useFeatureFlag';

const useSystemsViewFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.systems-view');
  const hasLocalFlag = localStorage.getItem('ui.systems-view') === 'true';

  // Test override: Force legacy InventoryTable component
  const forceInventoryTable =
    localStorage.getItem('ui.legacy-inventory-table') === 'true';
  if (forceInventoryTable) {
    return false;
  }

  return hasUnleashFlag || hasLocalFlag;
};

export default useSystemsViewFeatureFlag;
