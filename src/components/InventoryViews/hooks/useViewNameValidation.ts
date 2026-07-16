import type { ViewOut } from '../../../api/inventoryViewsApi';

export const validateViewName = (
  viewsList: ViewOut[],
  name: string,
  options?: { excludeViewId?: string },
) => {
  const trimmedName = name.trim();
  const isDuplicate =
    trimmedName.length > 0 &&
    viewsList.some(
      (v) =>
        v.name.toLowerCase() === trimmedName.toLowerCase() &&
        v.id !== options?.excludeViewId,
    );

  const validated = isDuplicate ? ('error' as const) : ('default' as const);

  return { isDuplicate, validated };
};
