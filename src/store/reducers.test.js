import { tableReducer, entitesDetailReducer } from './reducers';

describe('tableReducer', () => {
    const INVENTORY_ACTION_TYPES = {
        LOAD_ENTITIES_FULFILLED: 'load_entities_fulfiled'
    };
    test('should show default state', () => {
        expect(tableReducer(INVENTORY_ACTION_TYPES)(undefined, {})).toMatchObject({ loaded: false });
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
