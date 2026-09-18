type HostWithGroups = {
  groups?: ReadonlyArray<
    | {
        ungrouped?: boolean | null;
        name?: string | null;
      }
    | undefined
  > | null;
};

export const hasWorkspace = (system: HostWithGroups): boolean => {
  const ungrouped = system?.groups?.[0]?.ungrouped;
  return ungrouped === undefined ? false : !ungrouped;
};

export const hasSameWorkspace = (
  system: HostWithGroups,
  _: number,
  systemArr: HostWithGroups[],
): boolean => {
  return system?.groups?.[0]?.name === systemArr[0]?.groups?.[0]?.name;
};
