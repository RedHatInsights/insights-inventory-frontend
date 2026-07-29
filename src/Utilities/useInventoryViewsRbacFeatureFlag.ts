import useFeatureFlag from './useFeatureFlag';

const useInventoryViewsRbacFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('hbi.inventory-views-rbac');
  const hasLocalFlag =
    localStorage.getItem('hbi.inventory-views-rbac') === 'true';

  return hasUnleashFlag || hasLocalFlag;
};

export default useInventoryViewsRbacFeatureFlag;
