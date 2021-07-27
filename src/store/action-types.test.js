import {
    ACTION_TYPES,
    INVENTORY_ACTION_TYPES,
    SYSTEM_ISSUE_TYPES,
    asyncActions,
    asyncInventory,
    systemIssues
} from './action-types';

const asyncTypes = ['', '_PENDING', '_FULFILLED', '_REJECTED'];

asyncTypes.map((type) => {
    asyncActions.forEach((item) => {
        it(`${item}${type} should be defined`, () => {
            expect(ACTION_TYPES[`${item}${type}`]).toBeDefined();
        });
    });

    asyncInventory.forEach((item) => {
        it(`${item}${type} should be defined`, () => {
            expect(INVENTORY_ACTION_TYPES[`${item}${type}`]).toBeDefined();
        });
    });

    systemIssues.forEach((item) => {
        it(`${item}${type} should be defined`, () => {
            expect(SYSTEM_ISSUE_TYPES[`${item}${type}`]).toBeDefined();
        });
    });
});

