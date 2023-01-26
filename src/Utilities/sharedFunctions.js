import { loadEntities } from '../store/inventory-actions';

export const subtractWeeks = (numOfWeeks, date = new Date()) => {
    date.setDate(date.getDate() - numOfWeeks * 7);

    return date;
};

export const verifyCollectorStaleness = (reporterStaleness) =>{
    const stalenessDate = new Date(reporterStaleness.stale_timestamp);
    const currentDateTime = new Date();

    const twoWeeksPeriod = subtractWeeks(2);
    const oneWeeksPeriod = subtractWeeks(1);

    if (stalenessDate > currentDateTime) {
        return 'Fresh';
    } else if (oneWeeksPeriod < stalenessDate && stalenessDate < currentDateTime) {
        return 'Stale';
    }
    else if (twoWeeksPeriod < stalenessDate && stalenessDate < oneWeeksPeriod) {
        return 'Stale warning';
    } else {
        return 'Culled';
    }
};

export const verifyCulledInsightsClient = (perReporterStaleness) => {
    //TODO: get rid of !perReporterStaleness condition when dependant apps have per_reporter_staleness info
    if (!perReporterStaleness) {
        return false;
    }
    else if (perReporterStaleness.puptoo) {
        return verifyCollectorStaleness(perReporterStaleness.puptoo) === 'Culled';
    } else {
        return true;
    }
};

export const loadSystems = (options, showTags, getEntities) => {
    const limitedItems = options?.items?.length > options.per_page ? options?.items?.slice(
        (options?.page - 1) * options.per_page, options?.page * options.per_page
    ) : options?.items;

    const config = {
        ...options.hasItems && {
            sortBy: options?.sortBy?.key,
            orderDirection: options?.sortBy?.direction?.toUpperCase()
        },
        ...options,
        filters: options?.filters || options?.activeFilters,
        orderBy: options?.orderBy || options?.sortBy?.key,
        orderDirection: options?.orderDirection?.toUpperCase() || options?.sortBy?.direction?.toUpperCase(),
        ...limitedItems?.length > 0 && {
            itemsPage: options?.page,
            page: 1
        }
    };

    return loadEntities(limitedItems, config, { showTags }, getEntities);
};
