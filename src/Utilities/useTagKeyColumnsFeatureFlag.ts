import useFeatureFlag from './useFeatureFlag';

/**
 * Gates per-tag-key columns on Inventory Views: the Manage columns picker,
 * restoring `tag:` columns from a saved view, and showing them in the table.
 * `localStorage['hbi.ui.tag-key-columns'] = 'true'` enables it without Unleash.
 */
const useTagKeyColumnsFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('hbi.ui.tag-key-columns');
  const hasLocalFlag =
    localStorage.getItem('hbi.ui.tag-key-columns') === 'true';

  return Boolean(hasUnleashFlag) || hasLocalFlag;
};

export default useTagKeyColumnsFeatureFlag;
