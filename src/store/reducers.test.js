import { entitiesReducer, entitesDetailReducer } from './reducers';

describe('entitiesReducer', () => {
    test('should show default state', () => {
        expect(entitiesReducer(undefined, {})).toMatchObject({ loaded: false });
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
