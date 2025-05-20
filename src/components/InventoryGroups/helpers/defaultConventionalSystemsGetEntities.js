export const defaultConventionalSystemsGetEntities = async (
  items,
  config,
  showTags,
  defaultGetEntities,
) =>
  await defaultGetEntities(
    items,
    {
      ...config,
      filters: {
        ...config.filters,
        hostTypeFilter: 'nil', // request only conventional systems
      },
    },
    showTags,
  );
