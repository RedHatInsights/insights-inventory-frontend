import type { System } from '../hooks/useSystemsQuery';

export const hasWorkspace = (system: System): boolean => {
  const ungrouped = system?.groups?.[0]?.ungrouped;
  return ungrouped === undefined ? false : !ungrouped;
};

export const hasSameWorkspace = (
  system: System,
  _: number,
  systemArr: System[],
): boolean => {
  return system?.groups?.[0]?.name === systemArr[0]?.groups?.[0]?.name;
};
