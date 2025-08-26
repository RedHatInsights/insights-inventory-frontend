import useFeatureFlag from '../useFeatureFlag';

export const useLightspeedFeatureFlag = () => {
  const isFlagEnabled = useFeatureFlag('platform.lightspeed-rebrand');
  return isFlagEnabled ? 'Lightspeed' : 'Insights';
};
