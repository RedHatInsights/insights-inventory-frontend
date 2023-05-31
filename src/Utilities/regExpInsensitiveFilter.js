// run a predicate function over each key of an object
// const hasValue = f => o =>
//  Object.keys(o).some(x => f(o[x]))
const hasValue = f => o => {
    let key;
    for (key in o) {
        if (f(o[key])) {return true;}
    }

    return false;
};

// convert string to regular expression
const toReg = str =>
    new RegExp(str?.replace(/\//g, '//'), 'gi');

// test a string with a regular expression
const match = reg => x =>
    reg?.test(x);

// filter an array by a predicate
const filter = f => a => a?.filter(f);

export const filterArrOfObjByValueUsingRegexp = value => {
    // create a regular expression based on your search value
    // cache it for all filter iterations
    const reg = toReg(value);
    // filter your array of people
    return filter(
    // only return the results that match the regex
        hasValue(match(reg))
    );
};
