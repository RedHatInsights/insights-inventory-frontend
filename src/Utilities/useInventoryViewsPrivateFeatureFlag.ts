import useFeatureFlag from './useFeatureFlag';

const useInventoryViewsPrivateFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.inventory-views-private');
  const hasLocalFlag =
    localStorage.getItem('ui.inventory-views-private') === 'true';

  return hasUnleashFlag || hasLocalFlag;
};

export default useInventoryViewsPrivateFeatureFlag;
