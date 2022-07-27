export const subtractWeeks = (numOfWeeks, date = new Date()) => {
    date.setDate(date.getDate() - numOfWeeks * 7);

    return date;
};

export const verifyDisconnectedSystem = (perReporterStaleness) => {
    if (perReporterStaleness && !perReporterStaleness.puptoo) {
        return true;
    } else if (perReporterStaleness && perReporterStaleness.puptoo) {
        const stalenessDate = new Date(perReporterStaleness.puptoo.stale_timestamp);
        const twoWeeksPeriod = subtractWeeks(2);
        if (twoWeeksPeriod > stalenessDate) {
            return true;
        }
    }

    return false;
};
