import useFeatureFlag from './useFeatureFlag';

const useSystemsViewFeatureFlag = () => {
  const hasUnleashFlag = useFeatureFlag('ui.systems-view');
  const hasLocalFlag = localStorage.getItem('ui.systems-view') === 'true';

  return hasUnleashFlag || hasLocalFlag;
};

export default useSystemsViewFeatureFlag;
