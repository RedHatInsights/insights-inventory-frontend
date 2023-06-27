import { INVENTORY_ACTION_TYPES } from './action-types';
import { entitesDetailReducer, tableReducer } from './reducers';

describe('tableReducer', () => {
  test('should show default state', () => {
    expect(tableReducer(undefined, {})).toMatchObject({ loaded: false });
  });

  it('by default merges results', () => {
    expect(
      tableReducer(
        {},
        {
          type: INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED,
          payload: { results: [{ id: '123' }] },
        }
      )
    ).toEqual({ rows: [{ id: '123', selected: undefined }] });
  });

  it('merges results when the request is newer than state', () => {
    expect(
      tableReducer(
        { lastDateRequest: 1 },
        {
          type: INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED,
          payload: { results: [{ id: '123' }] },
          meta: { lastDateRequest: 1 },
        }
      )
    ).toEqual({
      lastDateRequest: 1,
      rows: [{ id: '123', selected: undefined }],
    });
  });

  it('does not merge results when the request is older than state', () => {
    expect(
      tableReducer(
        { lastDateRequest: 2 },
        {
          type: INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED,
          payload: { results: [{ id: '123' }] },
          meta: { lastDateRequest: 1 },
        }
      )
    ).toEqual({ lastDateRequest: 2 });
  });
});

describe('entitesDetailReducer', () => {
  const INVENTORY_ACTION_TYPES = {
    LOAD_ENTITY_FULFILLED: 'load_entity_fulfiled',
  };

  test('should show default state', () => {
    expect(
      entitesDetailReducer(INVENTORY_ACTION_TYPES)(undefined, {})
    ).toMatchObject({ loaded: false });
  });
});
