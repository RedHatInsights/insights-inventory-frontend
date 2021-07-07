import { tableReducer, entitesDetailReducer } from './reducers';

describe('tableReducer', () => {
    test('should show default state', () => {
        expect(tableReducer(undefined, {})).toMatchObject({ loaded: false });
    });
});

describe('entitesDetailReducer', () => {
    const INVENTORY_ACTION_TYPES = {
        LOAD_ENTITY_FULFILLED: 'load_entity_fulfiled'
    };

    test('should show default state', () => {
        expect(entitesDetailReducer(INVENTORY_ACTION_TYPES)(undefined, {})).toMatchObject({ loaded: false });
    });
});
