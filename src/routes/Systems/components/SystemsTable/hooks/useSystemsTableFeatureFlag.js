import useFeatureFlag from '../../../../../Utilities/useFeatureFlag';
import useLocalStorage from '../../../../../Utilities/useLocalStorage';

const useSystemsTableFeatureFlag = () => {
  const unleashFlag = useFeatureFlag('ui.systems-table');
  const localFlag = useLocalStorage('ui.systems-table', false);

  const isSystemsTableEnabled = unleashFlag || localFlag;

  return isSystemsTableEnabled;
};

export default useSystemsTableFeatureFlag;
