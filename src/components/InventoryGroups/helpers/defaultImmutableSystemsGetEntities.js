export const defaultImmutableSystemsGetEntities = async (
  items,
  config,
  showTags,
  defaultGetEntities
) =>
  await defaultGetEntities(
    items,
    {
      ...config,
      filters: {
        ...config.filters,
        hostTypeFilter: 'edge', // request only edge systems
      },
    },
    showTags
  );
