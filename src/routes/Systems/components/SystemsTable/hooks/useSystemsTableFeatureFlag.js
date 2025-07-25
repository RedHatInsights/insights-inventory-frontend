import useFeatureFlag from '../../../../../Utilities/useFeatureFlag';

const useSystemsTableFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.systems-table');
  const hasLocalFlag = localStorage.getItem('ui.systems-table') === 'true';

  const isSystemsTableEnabled = hasUnleashFlag || hasLocalFlag;

  return isSystemsTableEnabled;
};

export default useSystemsTableFeatureFlag;
