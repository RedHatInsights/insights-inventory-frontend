import useFeatureFlag from './useFeatureFlag';

const useInventoryViewsColumnsRbacFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('hbi.inventory-views-rbac');
  const hasLocalFlag =
    localStorage.getItem('hbi.inventory-views-rbac') === 'true';

  return hasUnleashFlag || hasLocalFlag;
};

export default useInventoryViewsColumnsRbacFeatureFlag;
