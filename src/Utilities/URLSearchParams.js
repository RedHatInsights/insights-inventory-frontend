/**
 * This module exports functions to work with the URL search parameters.
 * The functions require window.location and window.history to be available.
 */
export const updateURLSearchParams = (filters = {}, filtersConfig) => {
    const filtersVerified = Object.fromEntries(
        Object.entries(filters)
        .filter(([key]) => filtersConfig[key] !== undefined)
        .map(([key, value]) => {
            const { paramName, transformToParam } = filtersConfig[key];
            return [paramName, transformToParam ? transformToParam(value) : value];
        })
    );
    const newSearch = new URLSearchParams(filtersVerified).toString();
    const newPathname = window.location.pathname + '?' + newSearch;
    window.history.replaceState(null, '', newPathname);
};

export const readURLSearchParams = (params = '', filtersConfig) => {
    const searchParams = new URLSearchParams(params);
    const filtersVerified = Array.from(searchParams.entries())
    .filter(([key]) =>
        // check whether the parameter is present in the filters configuration
        Object.values(filtersConfig).find(({ paramName }) => paramName === key)
    )
    .map(([key, value]) => {
        // transform back to the filters representation
        const [filterName, { transformFromParam }] = Object.entries(
            filtersConfig
        ).find(([, config]) => config.paramName === key);

        return [
            filterName,
            transformFromParam ? transformFromParam(value) : value
        ];
    });

    return Object.fromEntries(filtersVerified);
};
