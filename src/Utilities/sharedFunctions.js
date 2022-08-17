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
