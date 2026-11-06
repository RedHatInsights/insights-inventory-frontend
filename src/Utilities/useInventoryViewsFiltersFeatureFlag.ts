import useFeatureFlag from './useFeatureFlag';

/**
 * Gates the app-data filter groups (Advisor, Vulnerability) on the
 * `/hosts/views` toolbar. Disabled means those filters are hidden and their
 * URL params / saved-view keys are ignored.
 */
const useInventoryViewsFiltersFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.inventory-views-filters');
  const hasLocalFlag =
    localStorage.getItem('ui.inventory-views-filters') === 'true';

  return Boolean(hasUnleashFlag) || hasLocalFlag;
};

export default useInventoryViewsFiltersFeatureFlag;
