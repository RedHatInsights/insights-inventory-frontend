export * from './useTextFilter';
export * from './useStalenessFilter';
export * from './useRegisteredWithFilter';
export * from './useTagsFilter';
export * from './useOperatingSystemFilter';
export * from './useRhcdFilter';
export * from './useUpdateMethodFilter';
export * from './useLastSeenFilter';
export * from './useGroupFilter';
export const filtersReducer = (reducersList) => (state, action) => reducersList.reduce((acc, curr) => ({
    ...acc,
    ...curr?.(state, action)
}), state);
