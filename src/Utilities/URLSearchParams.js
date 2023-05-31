/**
 * This module exports functions to work with the URL search parameters.
 * The functions require window.location and window.history to be available.
 */
export const updateURLSearchParams = (filters = {}, filtersConfig) => {
    const filtersVerified = [];

    Object.entries(filters)
    .filter(([key]) => filtersConfig[key] !== undefined)
    .forEach(([key, value]) => {
        const { paramName, transformToParam, isSeparated } = filtersConfig[key];
        const paramValue = transformToParam ? transformToParam(value) : value;

        if (isSeparated) {
            // paramValue must be an array in that case
            paramValue.forEach((item) => {
                filtersVerified.push([paramName, item]);
            });
        } else {
            filtersVerified.push([paramName, paramValue]);
        }
    });

    const newSearch = new URLSearchParams(filtersVerified).toString();
    const newPathname = window.location.pathname + '?' + newSearch;
    window.history.replaceState(null, '', newPathname);
};

export const readURLSearchParams = (params = '', filtersConfig) => {
    const searchParams = new URLSearchParams(params);

    const outputFilters = {};

    Array.from(searchParams.entries())
    .filter(([key]) =>
        // check whether the parameter is present in the filters configuration
        Object.values(filtersConfig).find(({ paramName }) => paramName === key)
    )
    .forEach(([key, value]) => {
        // transform back to the filters representation
        const [filterName, { transformFromParam, isSeparated }] = Object.entries(
            filtersConfig
        ).find(([, config]) => config.paramName === key);

        const finalValue  = transformFromParam ? transformFromParam(value) : value;

        if (isSeparated === true) {
            // means this is an array of values corresponding to the same parameter
            if (outputFilters[filterName] !== undefined) {
                outputFilters[filterName].push(finalValue);
            } else {
                outputFilters[filterName] = [finalValue];
            }
        } else {
            outputFilters[filterName] = finalValue;
        }
    });

    return outputFilters;
};
