export const subtractWeeks = (numOfWeeks, date = new Date()) => {
    date.setDate(date.getDate() - numOfWeeks * 7);

    return date;
};

export const verifyCollectorStaleness = (reporterStaleness) =>{
    const stalenessDate = new Date(reporterStaleness.stale_timestamp);
    const twoWeeksPeriod = subtractWeeks(2);

    if (twoWeeksPeriod > stalenessDate) {
        return true;
    } else {
        return false;
    }
};

export const verifyStaleInsightsClient = (perReporterStaleness = {}) => {
    if (perReporterStaleness.puptoo) {
        return verifyCollectorStaleness(perReporterStaleness.puptoo);
    } else {
        return true;
    }
};
