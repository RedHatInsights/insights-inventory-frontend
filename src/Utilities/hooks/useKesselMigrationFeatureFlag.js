import useFeatureFlag from '../useFeatureFlag';

export const useKesselMigrationFeatureFlag = () => {
  const isFlagEnabled = useFeatureFlag('inventory-frontend.kessel-enabled');
  return isFlagEnabled || false;
};
