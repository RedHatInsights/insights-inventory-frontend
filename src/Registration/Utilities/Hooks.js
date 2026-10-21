import useFeatureFlag from '../../Utilities/useFeatureFlag';

export { useFeatureFlag };

export const useLightspeedFeatureFlag = () => {
  const isFlagEnabled = useFeatureFlag('platform.lightspeed-rebrand');
  return isFlagEnabled ? 'Lightspeed' : 'Insights';
};
