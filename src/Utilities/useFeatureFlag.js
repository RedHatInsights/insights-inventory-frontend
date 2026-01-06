import {
  useFlag,
  useFlagsStatus,
  useVariant,
} from '@unleash/proxy-client-react';

export default (flag) => {
  const { flagsReady } = useFlagsStatus();
  const isFlagEnabled = useFlag(flag);
  return flagsReady ? isFlagEnabled : undefined;
};

export const useFeatureVariant = (flag) => {
  const { flagsReady } = useFlagsStatus();
  const variant = useVariant(flag);

  const isEnabled = flagsReady ? variant.enabled : false;

  let payload = undefined;
  if (flagsReady && variant.payload) {
    try {
      payload = JSON.parse(variant.payload.value);
    } catch {
      payload = undefined;
    }
  }

  return {
    isEnabled,
    body: payload?.body,
    title: payload?.title,
  };
};
