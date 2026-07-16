export const buildGroupIdParam = (
  groupIds: string[] | undefined,
): { groupId: string[] } | Record<string, never> => {
  if (!groupIds?.length) return {};

  const hasEmpty = groupIds.includes('');
  const nonEmpty = groupIds.filter((id) => id !== '');

  return { groupId: hasEmpty ? [...nonEmpty, ''] : nonEmpty };
};
