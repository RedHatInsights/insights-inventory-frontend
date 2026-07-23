import useFeatureFlag from '../useFeatureFlag';

export const useKesselMigrationFeatureFlag = () => {
  const isFlagEnabled = useFeatureFlag('hbi.rbac-v2');
  return isFlagEnabled || false;
};
