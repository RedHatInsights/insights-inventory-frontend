import useFeatureFlag from '../useFeatureFlag';

export const useKesselMigrationFeatureFlag = () => {
  const isFlagEnabled = useFeatureFlag('platform.rbac.workspaces');
  return isFlagEnabled || false;
};
