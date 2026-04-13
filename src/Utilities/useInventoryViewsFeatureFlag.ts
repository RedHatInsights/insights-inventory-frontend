import useFeatureFlag from './useFeatureFlag';

const useInventoryViewsFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.inventory-views');
  const hasLocalFlag = localStorage.getItem('ui.inventory-views') === 'true';

  return hasUnleashFlag || hasLocalFlag;
};

export default useInventoryViewsFeatureFlag;
