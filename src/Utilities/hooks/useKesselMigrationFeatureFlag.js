import useFeatureFlag from '../useFeatureFlag';

export const useKesselMigrationFeatureFlag = () => {
  const isFlagEnabled = useFeatureFlag('inventory-frontend.kessel-enabled');
  const hasLocalFlag =
    localStorage.getItem('inventory-frontend.kessel-enabled') === 'true';
  return isFlagEnabled || hasLocalFlag;
};
