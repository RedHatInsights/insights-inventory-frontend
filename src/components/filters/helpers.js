import moment from 'moment';

export const oldestDate = new Date(1950, 1, 1);
//validators control what date ranges can be selected in the component.
//both validators need to keep in mind todays date, and the other components inputed date.

//maxDate is the other date pickers currently selected Date
//date is patternfly component date
export const fromValidator = (maxDate) => (date) => {
    const todaysDate = moment().startOf('day');
    const newMaxDate = moment(maxDate).startOf('day');

    if (date < oldestDate) {
        return 'Date is before the allowable range.';
    } else if (date > newMaxDate) {
        return `End date must be later than Start date.`;
    } else if (date > todaysDate) {
        return ' Start date must be earlier than End date.';
    } else {
        return '';
    }
};

//minDate is the other components currently selected Date
//dateToValidate is patternfly component date.
export const toValidator = (minDate) => (dateToValidate) => {
    const todaysDate = moment().endOf('day');
    const newDatetoValidate = new Date(dateToValidate);
    const newMinDate = moment(minDate).startOf('day');

    if (newDatetoValidate < newMinDate) {
        return 'Start date must be earlier than End date.';
    } else if (newDatetoValidate > todaysDate) {
        return `Date must be ${todaysDate.toISOString().split('T')[0]} or earlier`;
    } else {
        return '';
    }
};
